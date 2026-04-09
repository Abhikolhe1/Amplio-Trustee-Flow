import * as Yup from 'yup';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';

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

// Issuance Details function
export default function IssuanceDetails({ currData, percent, saveStepData }) {
  const issuanceSchema = Yup.object({
    securityType: Yup.string().required('Security Type is required'),
    isinPrefix: Yup.string().required('ISIN Prefix is required'),
    issueSize: Yup.string().required(' Issue size is required'),
    issueDate: Yup.date().nullable().required('Issue Date is required'),
    creditRating: Yup.string().required('Credit Rating is required'),
  });

  const defaultValues = useMemo(() => {
    // const stored = localStorage.getItem('issuanceDetails');

    const currIssuanceDetails = currData ? currData : null;

    return {
      securityType: currIssuanceDetails?.securityType || '',
      isinPrefix: currIssuanceDetails?.isinPrefix || '',
      issueSize: currIssuanceDetails?.issueSize || '',
      issueDate: currIssuanceDetails?.issueDate ? new Date(currIssuanceDetails.issueDate) : null,
      creditRating: currIssuanceDetails?.creditRating || '',
    };
  }, []);

  const methods = useForm({
    resolver: yupResolver(issuanceSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const values = useWatch({ control });

  const onSubmit = handleSubmit((data) => {
    // console.log('clicked', data);
    // localStorage.setItem('issuanceDetails', JSON.stringify(data));
    saveStepData(data);
  });

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
              <RHFTextField name="securityType" label="Security Type" />
              <Typography variant="caption" color="text.secondary">
                Auto-determined by SPV structure · Cannot be changed
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField name="isinPrefix" label="ISIN Prefix" />
              <Typography variant="caption" color="text.secondary">
                All Indian securities start with INE
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField name="issueSize" label="Issue Size" />
              <Typography variant="caption" color="text.secondary">
                Pulled from Step 2 · Pool Limit = max issuance size
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* <RHFTextField name="issueDate" label="Issue Date" /> */}

              <Controller
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
              />
            </Grid>

            <Grid item xs={12}>
              <RHFTextField name="creditRating" label="Credit Rating" />
            </Grid>
          </Grid>

          {/* Button Submit */}
          <Stack mt={2} alignItems="flex-end">
            <Button
              type="submit"
              variant="contained"
              disabled={!isValid || isSubmitting}
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
  percent: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
  saveStepData: PropTypes.func.isRequired,
};
