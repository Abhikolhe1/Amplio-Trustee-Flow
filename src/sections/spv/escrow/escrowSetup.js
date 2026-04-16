import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Card, Typography } from '@mui/material';
import { Box, Container, Stack } from '@mui/system';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useGetSpvApplicationStepData } from 'src/api/spvApplication';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { useParams } from 'src/routes/hook';
import * as yup from 'yup';

const ESCROW_ACCOUNT_DEFAULTS = [
  {
    accountLabel: 'Escrow Account 1',
    title: 'Primary Escrow Account',
    subtitle: 'This account stores transactions that were settled successfully.',
    accountType: 'Collection Escrow',
    bankName: 'Axis Bank',
    branchDetails: 'Pune Main Branch',
    accountNumber: '123456789012',
    ifscCode: 'UTIB0000123',
  },
  {
    accountLabel: 'Escrow Account 2',
    title: 'Buffer Escrow Account',
    subtitle: 'This account stores buffer transactions and reserve funds for protection.',
    accountType: 'Reserve Escrow',
    bankName: 'Axis Bank',
    branchDetails: 'Mumbai Fort Branch',
    accountNumber: '987654321098',
    ifscCode: 'UTIB0000456',
  },
];

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const accountSchema = yup.object().shape({
  accountType: yup.string().required('Account type is required'),
  bankName: yup.string().required('Bank name is required'),
  branchDetails: yup.string().required('Branch details are required'),
  accountNumber: yup.string().trim().required('Account number is required'),
  ifscCode: yup
    .string()
    .required('IFSC code is required')
    .trim()
    .transform((value) => value?.toUpperCase())
    .matches(IFSC_REGEX, 'Enter valid IFSC (e.g., SBIN0001234)'),
});

function normalizeEscrowAccount(account = {}, fallback = {}) {
  const accountNumber =
    account.accountNumber ?? account.accountNo ?? fallback.accountNumber ?? '';
  const ifscSource = account.ifscCode ?? fallback.ifscCode ?? '';

  return {
    accountLabel: account.accountLabel || fallback.accountLabel || '',
    accountType: account.accountType || fallback.accountType || '',
    bankName: account.bankName || account.bank || fallback.bankName || fallback.bank || '',
    branchDetails:
      account.branchDetails || account.location || fallback.branchDetails || fallback.location || '',
    accountNumber: `${accountNumber}`.trim(),
    ifscCode: `${ifscSource}`.trim().toUpperCase(),
  };
}

function getSavedAccounts(currData) {
  if (Array.isArray(currData?.generatedAccounts) && currData.generatedAccounts.length > 0) {
    return currData.generatedAccounts;
  }

  if (Array.isArray(currData?.accounts) && currData.accounts.length > 0) {
    return currData.accounts;
  }

  if (currData?.bankName || currData?.branchDetails || currData?.accountNumber || currData?.ifscCode) {
    return [currData];
  }

  return [];
}

function getInitialAccount(currData, index) {
  const fallback = ESCROW_ACCOUNT_DEFAULTS[index];
  const savedAccounts = getSavedAccounts(currData);
  const savedAccount = savedAccounts[index];

  return normalizeEscrowAccount(savedAccount, fallback);
}

function EscrowCard({ title, subtitle, methods, disabled = false }) {
  const isGenerated = !disabled;

  return (
    <FormProvider methods={methods} onSubmit={() => {}}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography color="primary" variant="h5">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
          {!isGenerated && (
            <Typography variant="body2" color="text.secondary">
              Click the Generate Account button below to create this escrow account and show its
              full setup details.
            </Typography>
          )}
        </Stack>

        {isGenerated ? (
          <Box
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            <RHFTextField name="accountType" label="Account Type" disabled />
            <RHFTextField name="bankName" label="Bank Name" disabled />
            <RHFTextField name="accountNumber" label="Account Number" disabled />
            <RHFTextField name="ifscCode" label="IFSC Code" disabled />
            <RHFTextField name="branchDetails" label="Branch Details" disabled />
          </Box>
        ) : null}
      </Card>
    </FormProvider>
  );
}

EscrowCard.propTypes = {
  disabled: PropTypes.bool,
  methods: PropTypes.object.isRequired,
  subtitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

function EscrowSetupView({ percent, setActiveStepId, saveStepData }) {
  const params = useParams();
  const { id } = params;
  const { stepData } = useGetSpvApplicationStepData(id, 'escrow');
  const [currData, setCurrData] = useState();

  const accountOneDefaults = useMemo(() => getInitialAccount(currData, 0), [currData]);
  const accountTwoDefaults = useMemo(() => getInitialAccount(currData, 1), [currData]);

  const accountOneMethods = useForm({
    resolver: yupResolver(accountSchema),
    defaultValues: accountOneDefaults,
    mode: 'onChange',
  });

  const accountTwoMethods = useForm({
    resolver: yupResolver(accountSchema),
    defaultValues: accountTwoDefaults,
    mode: 'onChange',
  });

  const [generatedCount, setGeneratedCount] = useState(0);

  useEffect(() => {
    if (stepData) {
      setCurrData(stepData);
    }
  }, [stepData]);

  useEffect(() => {
    accountOneMethods.reset(accountOneDefaults);
  }, [accountOneDefaults, accountOneMethods]);

  useEffect(() => {
    accountTwoMethods.reset(accountTwoDefaults);
  }, [accountTwoDefaults, accountTwoMethods]);

  useEffect(() => {
    const accounts = getSavedAccounts(currData);
    setGeneratedCount(Math.min(accounts.length, 2));
  }, [currData]);

  useEffect(() => {
    percent?.((generatedCount / 2) * 100);
  }, [generatedCount, percent]);

  const persistAccounts = async (accounts) => {
    const normalizedAccounts = accounts.map((account, index) =>
      normalizeEscrowAccount(account, ESCROW_ACCOUNT_DEFAULTS[index])
    );
    const primaryAccount = normalizedAccounts[0] || {};

    const payload = {
      bankName: primaryAccount.bankName || '',
      branchDetails: primaryAccount.branchDetails || '',
      accountNumber: primaryAccount.accountNumber || '',
      ifscCode: primaryAccount.ifscCode || '',
      generatedAccounts: normalizedAccounts,
    };

    try {
      await axiosInstance.patch(`/spv-pre/escrow/${id}`, payload);

      setCurrData(payload);
      saveStepData?.(payload);
    } catch (error) {
      console.error('Error saving escrow data:', error);
    }
  };

  const handleAction = async () => {
    if (generatedCount === 0) {
      const isValid = await accountOneMethods.trigger();
      if (!isValid) return;

      await persistAccounts([accountOneMethods.getValues()]);
      return;
    }

    if (generatedCount === 1) {
      const isValid = await accountTwoMethods.trigger();
      if (!isValid) return;

      await persistAccounts([accountOneMethods.getValues(), accountTwoMethods.getValues()]);
      return;
    }

    setActiveStepId('documents');
  };

  const actionLabel = generatedCount >= 2 ? 'Next' : 'Generate Account';

  return (
    <Container>
      <Alert severity="success" sx={{ mb: 2 }}>
        <strong>Trust Deed Signed.</strong> The primary escrow account is for settled successful
        transactions, and the buffer escrow account holds reserve or buffer transactions. Use the
        same button below to generate both accounts, then continue with Next.
      </Alert>

      <Stack spacing={3}>
        <EscrowCard
          title={ESCROW_ACCOUNT_DEFAULTS[0].title}
          subtitle={ESCROW_ACCOUNT_DEFAULTS[0].subtitle}
          methods={accountOneMethods}
          disabled={generatedCount < 1}
        />
        {generatedCount < 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={handleAction}>
              {actionLabel}
            </Button>
          </Box>
        )}

        <EscrowCard
          title={ESCROW_ACCOUNT_DEFAULTS[1].title}
          subtitle={ESCROW_ACCOUNT_DEFAULTS[1].subtitle}
          methods={accountTwoMethods}
          disabled={generatedCount < 2}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={handleAction}>
            {actionLabel}
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}

EscrowSetupView.propTypes = {
  currData: PropTypes.object,
  percent: PropTypes.func.isRequired,
  saveStepData: PropTypes.func,
  setActiveStepId: PropTypes.func.isRequired,
};

export default EscrowSetupView;
