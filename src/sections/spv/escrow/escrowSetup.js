import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Card, MenuItem, Typography } from '@mui/material';
import { Box, Container, Stack } from '@mui/system';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import * as yup from 'yup';

const ESCROW_ACCOUNT_DEFAULTS = [
  {
    accountLabel: 'Escrow Account 1',
    title: 'Primary Escrow Account',
    subtitle: 'This account stores transactions that were settled successfully.',
    accountType: 'Collection Escrow',
    bank: 'axis',
    location: 'Pune Main Branch',
    verification: 'Trustee + Platform Dual Authorization',
    expected: '2-3 Business Days',
  },
  {
    accountLabel: 'Escrow Account 2',
    title: 'Buffer Escrow Account',
    subtitle: 'This account stores buffer transactions and reserve funds for protection.',
    accountType: 'Reserve Escrow',
    bank: 'hdfc',
    location: 'Mumbai Fort Branch',
    verification: 'Trustee + Platform Dual Authorization',
    expected: '2-3 Business Days',
  },
];

const bankOptions = [
  { value: 'axis', label: 'Axis Bank (Preferred - Active Relationship)' },
  { value: 'hdfc', label: 'HDFC Bank' },
  { value: 'icici', label: 'ICICI Bank' },
  { value: 'kotak', label: 'Kotak Mahindra Bank' },
];

const accountSchema = yup.object().shape({
  accountType: yup.string().required('Account type is required'),
  bank: yup.string().required('Bank is required'),
  location: yup.string().required('Branch / City is required'),
  verification: yup.string().required('Verification method is required'),
  expected: yup.string().required('Expected setup time is required'),
});

function getInitialAccount(currData, index) {
  const savedAccount = currData?.accounts?.[index];
  const generatedAccount = currData?.generatedAccounts?.[index];
  const fallback = ESCROW_ACCOUNT_DEFAULTS[index];

  return {
    accountLabel: fallback.accountLabel,
    accountType: savedAccount?.accountType || generatedAccount?.accountType || fallback.accountType,
    bank: savedAccount?.bank || generatedAccount?.bank || fallback.bank,
    location: savedAccount?.location || generatedAccount?.location || fallback.location,
    verification:
      savedAccount?.verification || generatedAccount?.verification || fallback.verification,
    expected: savedAccount?.expected || generatedAccount?.expected || fallback.expected,
  };
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
            <RHFTextField name="accountType" label="Account Type" disabled={disabled} />

            <RHFSelect name="bank" label="Bank" disabled={disabled}>
              {bankOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField name="location" label="Branch / City" disabled={disabled} />
            <RHFTextField name="expected" label="Expected Setup Time" disabled={disabled} />

            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
              <RHFTextField name="verification" label="Verification Method" disabled={disabled} />
              <Typography variant="caption" mt={1} color="text.secondary">
                Bank freezes debit rights. All outflows require Trustee + Platform dual digital
                signature.
              </Typography>
            </Box>
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

function EscrowSetupView({ percent, setActiveStepId, currData, saveStepData }) {
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

  const [generatedCount, setGeneratedCount] = useState(() => {
    const accounts = currData?.accounts || currData?.generatedAccounts || [];
    return Math.min(accounts.length, 2);
  });

  useEffect(() => {
    accountOneMethods.reset(accountOneDefaults);
  }, [accountOneDefaults, accountOneMethods]);

  useEffect(() => {
    accountTwoMethods.reset(accountTwoDefaults);
  }, [accountTwoDefaults, accountTwoMethods]);

  useEffect(() => {
    const accounts = currData?.accounts || currData?.generatedAccounts || [];
    setGeneratedCount(Math.min(accounts.length, 2));
  }, [currData]);

  useEffect(() => {
    percent?.((generatedCount / 2) * 100);
  }, [generatedCount, percent]);

  const persistAccounts = (accounts) => {
    saveStepData({
      accounts,
      generatedAccounts: accounts,
      verification: accounts[0]?.verification || '',
      expected: accounts[0]?.expected || '',
      bank: accounts[0]?.bank || '',
      location: accounts[0]?.location || '',
      createdAt: currData?.createdAt || new Date().toISOString(),
    });
  };

  const handleAction = async () => {
    if (generatedCount === 0) {
      const isValid = await accountOneMethods.trigger();
      if (!isValid) return;

      const firstAccount = {
        ...accountOneMethods.getValues(),
        accountLabel: ESCROW_ACCOUNT_DEFAULTS[0].accountLabel,
      };

      persistAccounts([firstAccount]);
      setGeneratedCount(1);
      return;
    }

    if (generatedCount === 1) {
      const isValid = await accountTwoMethods.trigger();
      if (!isValid) return;

      const firstAccount = {
        ...accountOneMethods.getValues(),
        accountLabel: ESCROW_ACCOUNT_DEFAULTS[0].accountLabel,
      };
      const secondAccount = {
        ...accountTwoMethods.getValues(),
        accountLabel: ESCROW_ACCOUNT_DEFAULTS[1].accountLabel,
      };

      persistAccounts([firstAccount, secondAccount]);
      setGeneratedCount(2);
      return;
    }

    setActiveStepId('legal_documents');
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
  saveStepData: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
};

export default EscrowSetupView;
