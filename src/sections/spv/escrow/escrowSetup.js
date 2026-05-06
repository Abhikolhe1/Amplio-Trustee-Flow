import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Card, TextField, Typography } from '@mui/material';
import { Box, Container, Stack } from '@mui/system';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useGetSpvApplicationStepData } from 'src/api/spvApplication';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { useParams } from 'src/routes/hook';

const ESCROW_ACCOUNT_DEFAULTS = {
  title: 'Escrow Account',
  subtitle: 'This account stores all escrow and settlement transactions.',
  bankName: 'Axis Bank',
  branchDetails: 'Pune Main Branch',
  accountNumber: '123456789012',
  ifscCode: 'UTIB0000123',
};

// OLD MULTIPLE ESCROW FLOW
// const ESCROW_ACCOUNT_DEFAULTS = [
//   {
//     accountLabel: 'Escrow Account 1',
//     title: 'Primary Escrow Account',
//     subtitle: 'This account stores transactions that were settled successfully.',
//     accountType: 'collection_escrow',
//     bankName: 'Axis Bank',
//     branchDetails: 'Pune Main Branch',
//     accountNumber: '123456789012',
//     ifscCode: 'UTIB0000123',
//   },
//   {
//     accountLabel: 'Escrow Account 2',
//     title: 'Buffer Escrow Account',
//     subtitle: 'This account stores buffer transactions and reserve funds for protection.',
//     accountType: 'reserve_escrow',
//     bankName: 'Axis Bank',
//     branchDetails: 'Mumbai Fort Branch',
//     accountNumber: '987654321098',
//     ifscCode: 'UTIB0000456',
//   },
// ];

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// OLD ACCOUNT TYPES
// const ACCOUNT_TYPE_LABELS = {
//   collection_escrow: 'Collection Escrow',
//   reserve_escrow: 'Reserve Escrow',
// };

const accountSchema = yup.object().shape({
  // accountType: yup.string().required('Account type is required'),
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

  // OLD ACCOUNT TYPE LOGIC
  // const normalizedAccountType =
  //   account.accountType === 'Collection Escrow'
  //     ? 'collection_escrow'
  //     : account.accountType === 'Reserve Escrow'
  //       ? 'reserve_escrow'
  //       : account.accountType || fallback.accountType || '';

  return {
    // accountLabel: account.accountLabel || fallback.accountLabel || '',
    // accountType: normalizedAccountType,
    bankName: account.bankName || account.bank || fallback.bankName || fallback.bank || '',
    branchDetails:
      account.branchDetails || account.location || fallback.branchDetails || fallback.location || '',
    accountNumber: `${accountNumber}`.trim(),
    ifscCode: `${ifscSource}`.trim().toUpperCase(),
  };
}

function getEscrowPayload(data) {
  if (!data) return data;

  if (data?.data) {
    return getEscrowPayload(data.data);
  }

  if (data?.escrow) {
    return getEscrowPayload(data.escrow);
  }

  return data;
}

function getSavedAccounts(currData) {
  const escrowData = getEscrowPayload(currData);

  // HANDLE ARRAY RESPONSE FROM API
  if (Array.isArray(escrowData) && escrowData.length > 0) {
    return escrowData[0];
  }

  // HANDLE stepData ARRAY
  if (Array.isArray(escrowData?.stepData) && escrowData.stepData.length > 0) {
    return escrowData.stepData[0];
  }

  // OLD ARRAY SUPPORT
  // if (Array.isArray(escrowData) && escrowData.length > 0) {
  //   return escrowData;
  // }

  // if (Array.isArray(escrowData?.generatedAccounts) && escrowData.generatedAccounts.length > 0) {
  //   return escrowData.generatedAccounts;
  // }

  // if (Array.isArray(escrowData?.accounts) && escrowData.accounts.length > 0) {
  //   return escrowData.accounts;
  // }

  if (
    escrowData?.bankName ||
    escrowData?.branchDetails ||
    escrowData?.accountNumber ||
    escrowData?.accountNo ||
    escrowData?.ifscCode
  ) {
    return escrowData;
  }

  return {};
}

// OLD MULTIPLE ACCOUNT STATE
// function buildLocalEscrowState(accounts) {
//   const normalizedAccounts = accounts.map((account, index) =>
//     normalizeEscrowAccount(account, ESCROW_ACCOUNT_DEFAULTS[index])
//   );
//   const primaryAccount = normalizedAccounts[0] || {};

//   return {
//     accountType: primaryAccount.accountType || '',
//     bankName: primaryAccount.bankName || '',
//     branchDetails: primaryAccount.branchDetails || '',
//     accountNumber: primaryAccount.accountNumber || '',
//     ifscCode: primaryAccount.ifscCode || '',
//     accounts: normalizedAccounts,
//     generatedAccounts: normalizedAccounts,
//   };
// }

function pickEscrowState(stepData, currentData) {
  const normalizedStepData = getEscrowPayload(stepData);
  const normalizedCurrentData = getEscrowPayload(currentData);

  // HANDLE ARRAY RESPONSE
  if (Array.isArray(normalizedStepData) && normalizedStepData.length > 0) {
    return normalizedStepData[0];
  }

  // HANDLE stepData ARRAY
  if (
    Array.isArray(normalizedStepData?.stepData) &&
    normalizedStepData.stepData.length > 0
  ) {
    return normalizedStepData.stepData[0];
  }

  return normalizedStepData || normalizedCurrentData;
}

function getInitialAccount(currData) {
  return normalizeEscrowAccount(currData, ESCROW_ACCOUNT_DEFAULTS);

  // OLD MULTIPLE ACCOUNT LOGIC
  // const fallback = ESCROW_ACCOUNT_DEFAULTS[index];
  // const savedAccounts = getSavedAccounts(currData);
  // const savedAccount = savedAccounts[index];

  // return normalizeEscrowAccount(savedAccount, fallback);
}

function EscrowCard({ title, subtitle, methods, disabled = false, isReadOnly }) {
  const isGenerated = !disabled;

  // OLD ACCOUNT TYPE
  // const accountTypeValue = methods.watch('accountType');
  // const accountTypeLabel = ACCOUNT_TYPE_LABELS[accountTypeValue] || accountTypeValue || '';

  return (
    <FormProvider methods={methods} onSubmit={() => { }}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography color="primary" variant="h5">
            {title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>

          {/* OLD GENERATE FLOW */}
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

            {/* OLD ACCOUNT TYPE FIELD */}
            {/* <TextField
              label="Account Type"
              value={accountTypeLabel}
              inputProps={{
                readOnly: isReadOnly,
              }}
              fullWidth
            /> */}

            <RHFTextField
              name="bankName"
              label="Bank Name"
              inputProps={{
                readOnly: isReadOnly,
              }}
            />

            <RHFTextField
              name="accountNumber"
              label="Account Number"
              inputProps={{
                readOnly: isReadOnly,
              }}
            />

            <RHFTextField
              name="ifscCode"
              label="IFSC Code"
              inputProps={{
                readOnly: isReadOnly,
              }}
            />

            <RHFTextField
              name="branchDetails"
              label="Branch Details"
              inputProps={{
                readOnly: isReadOnly,
              }}
            />
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

function EscrowSetupView({
  currData: currentData,
  percent,
  setActiveStepId,
  saveStepData,
  isReadOnly
}) {
  const params = useParams();
  const { id } = params;

  const { stepData } = useGetSpvApplicationStepData(id, 'escrow');

  const [currData, setCurrData] = useState(currentData);

  // NEW SINGLE ACCOUNT GENERATED FLOW
  const [isGenerated, setIsGenerated] = useState(false);

  const accountDefaults = useMemo(
    () => getInitialAccount(currData),
    [currData]
  );

  const methods = useForm({
    resolver: yupResolver(accountSchema),
    defaultValues: accountDefaults,
    mode: 'onChange',
  });

  // OLD MULTIPLE METHODS
  // const accountOneDefaults = useMemo(() => getInitialAccount(currData, 0), [currData]);
  // const accountTwoDefaults = useMemo(() => getInitialAccount(currData, 1), [currData]);

  // const accountOneMethods = useForm({
  //   resolver: yupResolver(accountSchema),
  //   defaultValues: accountOneDefaults,
  //   mode: 'onChange',
  // });

  // const accountTwoMethods = useForm({
  //   resolver: yupResolver(accountSchema),
  //   defaultValues: accountTwoDefaults,
  //   mode: 'onChange',
  // });

  // const [generatedCount, setGeneratedCount] = useState(0);

  useEffect(() => {
    const nextData = pickEscrowState(stepData, currentData);

    if (nextData) {
      setCurrData(nextData);

      saveStepData?.(nextData);

      // OLD LOCAL STATE
      // saveStepData?.(buildLocalEscrowState(getSavedAccounts(nextData)));
    }
  }, [currentData, saveStepData, stepData]);

  useEffect(() => {
    methods.reset(accountDefaults);
  }, [accountDefaults, methods]);

  // DETECT SAVED ESCROW
  useEffect(() => {
    const savedAccount = getSavedAccounts(currData);

    if (
      savedAccount?.bankName ||
      savedAccount?.accountNumber ||
      savedAccount?.ifscCode
    ) {
      setIsGenerated(true);
    }
  }, [currData]);

  // OLD MULTIPLE RESET
  // useEffect(() => {
  //   accountOneMethods.reset(accountOneDefaults);
  // }, [accountOneDefaults, accountOneMethods]);

  // useEffect(() => {
  //   accountTwoMethods.reset(accountTwoDefaults);
  // }, [accountTwoDefaults, accountTwoMethods]);

  // NEW PERCENT FLOW
  useEffect(() => {
    percent?.(isGenerated ? 100 : 0);

    // OLD PERCENT LOGIC
    // const accounts = getSavedAccounts(currData);
    // setGeneratedCount(Math.min(accounts.length, 2));
  }, [isGenerated, percent]);

  const handleAction = async () => {

    // NEXT FLOW
    if (isGenerated) {
      setActiveStepId('credit_rating');
      return;
    }

    // GENERATE FLOW
    const isValid = await methods.trigger();

    if (!isValid) return;

    try {
      const payload = methods.getValues();

      await axiosInstance.patch(`/spv-pre/escrow/${id}`, payload);

      saveStepData?.(payload);

      // UPDATED CURRENT DATA
      setCurrData({
        ...payload,
        isGenerated: true,
      });

      setIsGenerated(true);

    } catch (error) {
      console.error('Error saving escrow data:', error);
    }

    // OLD MULTIPLE ACCOUNT FLOW
    // const existingAccounts = getSavedAccounts(currData);

    // if (generatedCount === 0) {
    //   const isValid = await accountOneMethods.trigger();
    //   if (!isValid) return;

    //   await persistAccount(accountOneMethods.getValues(), 0, existingAccounts);
    //   return;
    // }

    // if (generatedCount === 1) {
    //   const isValid = await accountTwoMethods.trigger();
    //   if (!isValid) return;

    //   await persistAccount(accountTwoMethods.getValues(), 1, existingAccounts);
    //   return;
    // }

    // setActiveStepId('documents');
  };

  return (
    <Container>
      <Alert severity="success" sx={{ mb: 2 }}>
        <strong>Trust Deed Signed.</strong> This escrow account will be used for
        transaction settlement and escrow management activities.
      </Alert>

      <Stack spacing={3}>
        <EscrowCard
          title={ESCROW_ACCOUNT_DEFAULTS.title}
          subtitle={ESCROW_ACCOUNT_DEFAULTS.subtitle}
          methods={methods}
          disabled={!isGenerated}
          isReadOnly={isReadOnly}
        />

        {/* OLD SECOND ESCROW */}
        {/* <EscrowCard
          title={ESCROW_ACCOUNT_DEFAULTS[1].title}
          subtitle={ESCROW_ACCOUNT_DEFAULTS[1].subtitle}
          methods={accountTwoMethods}
          disabled={generatedCount < 2}
          isReadOnly={isReadOnly}
        /> */}

        {!isReadOnly && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAction}
            >
              {isGenerated ? 'Next' : 'Generate Account'}
            </Button>
          </Box>
        )}

        {/* OLD GENERATE ACCOUNT BUTTON */}
        {/* {!isReadOnly && generatedCount >= 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAction}
            >
              {actionLabel}
            </Button>
          </Box>
        )} */}
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