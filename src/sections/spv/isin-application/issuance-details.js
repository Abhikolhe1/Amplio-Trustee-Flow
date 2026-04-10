import * as Yup from 'yup';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
// import { DatePicker } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';
import { useSnackbar } from 'src/components/snackbar';
import RHFDatePicker from 'src/components/hook-form/rhf-date-picker';

// a reusable function to calculate form progress
export const calculateFormProgress = (values) => {
  let filled = 0;
  let total = 0;

  for (let key in values) {
    total++;
    if (values[key] !== '' && values[key] !== null) {
      filled++;
    }
  }
  return Math.round((filled / total) * 100);
};

export default function IssuanceDetails({
  selectedDepository,
  creditAgecyWithRating,
  issueSize,
  currData,
  percent,
  saveStepData,
  setActiveStepId,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const securityType = [
    { value: 'secure', label: 'Secure' },
    { value: 'unsecure', label: 'Unsecure' },
  ];

  const issuanceSchema = Yup.object({
    securityType: Yup.string().required('Security Type is required'),
    // isinPrefix: Yup.string().required('ISIN Prefix is required'),
    issueSize: Yup.string().required(' Issue size is required'),
    // issueSize: Yup.number().typeError('Must be a number').required('Issue Size is required'),
    issueDate: Yup.date().nullable().required('Issue Date is required'),
    creditRating: Yup.string().required('Credit Rating is required'),
  });

  const defaultValues = {
    securityType: currData?.securityType || 'secure',
    issueSize: '',
    issueDate: currData?.issueDate ? new Date(currData.issueDate) : null,
    creditRating: '',
  };

  const methods = useForm({
    resolver: yupResolver(issuanceSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = useWatch({ control });

  const onSubmit = handleSubmit((data) => {
    try {
      saveStepData({
        ...data,
        depositoryId: selectedDepository,
      });
      enqueueSnackbar('Data Saved Successfully', { variant: 'success' });
      setActiveStepId('review_Activate');
    } catch (error) {
      enqueueSnackbar('Failed to save data', { variant: 'error' });
      throw error;
    }
  });

  useEffect(() => {
    reset({
      // securityType: currData?.securityType || 'secure',
      issueSize: issueSize || '',
      creditRating: creditAgecyWithRating || '',
      // issueDate: currData?.issueDate ? new Date(currData.issueDate) : null,
    });
  }, [issueSize, creditAgecyWithRating]);

  useEffect(() => {
    // sessionStorage.setItem('issuanceDetails', JSON.stringify(values));
    const progress = calculateFormProgress(values);
    percent(progress);
  }, [values]);

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Stack mb={2}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Issuance Details
          </Typography>
        </Stack>

        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              {/* <RHFTextField name="securityType" label="Security Type" /> */}
              <RHFSelect name="securityType" label="Security Type">
                {securityType.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              {/* <Typography variant="caption" color="text.secondary">
                Auto-determined by SPV structure · Cannot be changed
              </Typography> */}
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <RHFTextField name="isinPrefix" label="ISIN Prefix" />
              <Typography variant="caption" color="text.secondary">
                All Indian securities start with INE
              </Typography>
            </Grid> */}
            <Grid item xs={12} md={6}>
              <RHFTextField
                name="creditRating"
                label="Credit Rating"
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField name="issueSize" label="Issue Size" InputProps={{ readOnly: true }} />
              <Typography variant="caption" color="text.secondary">
                Pulled from Step 2 · Pool Limit = max issuance size
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* <RHFTextField name="issueDate" label="Issue Date" /> */}

              <RHFDatePicker
                name="issueDate"
                label="Issue Date"
                maxDate={new Date()}
                control={control}
              />

              {/* <Controller
                name="issueDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Issue Date"
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              /> */}
            </Grid>
          </Grid>

          {/* Button Submit */}
          <Stack mt={2} alignItems="flex-end">
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              color="primary"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              Save
            </Button>
          </Stack>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

IssuanceDetails.propTypes = {
  issueSize: PropTypes.string,
  creditAgecyWithRating: PropTypes.string,
  percent: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
  saveStepData: PropTypes.func.isRequired,
};
