import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo } from 'react';
import Container from '@mui/material/Container';
import { Box, Button, Card, Grid, MenuItem, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ----------------------------------------------------------------------

const MIN_FACE_VALUE = 1000;

const Window_Frequency = [
  {
    label: 'Every 7 Days',
    value: '7',
  },
  {
    label: 'Every 14 Days',
    value: '14',
  },
  {
    label: 'Every 30 Days (maturity only)',
    value: '30',
  },
];

const toPositiveInteger = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return 0;
  }

  return Math.floor(number);
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const getDefaultFaceValue = (poolLimit) => {
  if (!poolLimit) return 0;
  if (poolLimit >= MIN_FACE_VALUE && poolLimit % MIN_FACE_VALUE === 0) return MIN_FACE_VALUE;
  return poolLimit;
};

const getTotalUnits = (poolLimit, faceValue) => {
  if (!poolLimit || !faceValue || poolLimit % faceValue !== 0) {
    return 0;
  }

  return poolLimit / faceValue;
};

const getMinUnits = (minInvestment, faceValue) => {
  if (!minInvestment || !faceValue) {
    return 0;
  }

  return minInvestment / faceValue;
};

const clampValue = (value, min, max) => {
  if (!max) return 0;
  return Math.min(Math.max(value, min), max);
};

const getSuggestedMaxPtc = (totalUnits) => {
  if (!totalUnits) return 0;

  return totalUnits;
};

const getSuggestedMaxInvestPool = (totalUnits, minUnits) => {
  if (!totalUnits || !minUnits) return 0;

  return clampValue(Math.floor(totalUnits / minUnits) || 1, 1, totalUnits);
};

export default function PtcParameters({
  percent,
  setActiveStepId,
  currData,
  poolData,
  saveStepData,
}) {
  const theme = useTheme();
  const poolLimit = toPositiveInteger(poolData?.poolLimit);

  const FormSchema = useMemo(
    () =>
      Yup.object().shape({
        faceValue: Yup.number()
          .typeError('Face value is required')
          .integer('Face value must be a whole number')
          .min(MIN_FACE_VALUE, `Face value must be at least ${formatCurrency(MIN_FACE_VALUE)}`)
          .max(poolLimit || Number.MAX_SAFE_INTEGER, 'Face value cannot exceed pool limit')
          .test(
            'faceValue-divides-pool',
            'Face value must exactly divide the pool limit',
            (value) => {
              if (!poolLimit || !value) return false;
              return poolLimit % value === 0;
            }
          )
          .required('Face value is required'),
        minInvestment: Yup.number()
          .typeError('Minimum investment is required')
          .integer('Minimum investment must be a whole number')
          .min(Yup.ref('faceValue'), 'Minimum investment must be at least one PTC unit')
          .max(poolLimit || Number.MAX_SAFE_INTEGER, 'Minimum investment cannot exceed pool limit')
          .test(
            'minInvestment-multiple',
            'Minimum investment must be a multiple of face value',
            function validateMinInvestment(value) {
              const faceValue = Number(this.parent.faceValue);

              if (!value || !faceValue) return false;
              return value % faceValue === 0;
            }
          )
          .required('Minimum investment is required'),
        maxPtc: Yup.number()
          .typeError('Max PTC is required')
          .integer('Max PTC must be a whole number')
          .test('maxPtc-minUnits', 'Max PTC must be at least minimum units', function validateMaxPtc(value) {
            const faceValue = Number(this.parent.faceValue);
            const minInvestment = Number(this.parent.minInvestment);
            const totalUnits = getTotalUnits(poolLimit, faceValue);
            const minUnits = getMinUnits(minInvestment, faceValue);

            if (!value || !faceValue || !minInvestment || !totalUnits) return false;
            return value >= minUnits && value <= totalUnits;
          })
          .required('Max PTC is required'),
        maxInvestPool: Yup.number()
          .typeError('Max investors required')
          .integer('Max investors must be a whole number')
          .min(1, 'Max investors must be at least 1')
          .test(
            'maxInvestPool-totalUnits',
            'Max investors cannot exceed total units or over-allocate the pool',
            function validateMaxInvestPool(value) {
              const faceValue = Number(this.parent.faceValue);
              const minInvestment = Number(this.parent.minInvestment);
              const totalUnits = getTotalUnits(poolLimit, faceValue);
              const minUnits = getMinUnits(minInvestment, faceValue);

              if (!value || !faceValue || !minInvestment || !totalUnits || !minUnits) return false;
              return value <= totalUnits && value * minUnits <= totalUnits;
            }
          )
          .required('Max investors required'),
        windowFrequency: Yup.string().required('Select frequency'),
      }),
    [poolLimit]
  );

  const defaultValues = useMemo(() => {
    const faceValue = toPositiveInteger(currData?.faceValue) || getDefaultFaceValue(poolLimit);
    const totalUnits = getTotalUnits(poolLimit, faceValue);
    const minInvestment = toPositiveInteger(currData?.minInvestment) || faceValue;
    const minUnits = getMinUnits(minInvestment, faceValue);
    const maxPtc = toPositiveInteger(currData?.maxPtc) || getSuggestedMaxPtc(totalUnits);
    const maxInvestPool =
      toPositiveInteger(currData?.maxInvestPool) || getSuggestedMaxInvestPool(totalUnits, minUnits);

    return {
      faceValue,
      minInvestment,
      maxPtc,
      maxInvestPool,
      windowFrequency: currData?.windowFrequency || '7',
    };
  }, [currData, poolLimit]);

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const faceValue = toPositiveInteger(values.faceValue);
  const minInvestment = toPositiveInteger(values.minInvestment);
  const totalUnits = getTotalUnits(poolLimit, faceValue);
  const minUnits = getMinUnits(minInvestment, faceValue);
  const maxPtc = toPositiveInteger(values.maxPtc);
  const maxInvestment = faceValue && maxPtc ? faceValue * maxPtc : 0;
  const maxInvestPool = toPositiveInteger(values.maxInvestPool);
  const allocatedUnits = minUnits && maxInvestPool ? minUnits * maxInvestPool : 0;

  const requiredFields = ['faceValue', 'minInvestment', 'maxPtc', 'maxInvestPool', 'windowFrequency'];

  useEffect(() => {
    let completed = 0;

    requiredFields.forEach((field) => {
      if (values[field]) {
        completed += 1;
      }
    });

    const percentValue = (completed / requiredFields.length) * 100;
    percent?.(percentValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.faceValue, values.minInvestment, values.maxPtc, values.maxInvestPool, values.windowFrequency]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!poolLimit) return;

    const safeFaceValue =
      faceValue >= MIN_FACE_VALUE && faceValue <= poolLimit && poolLimit % faceValue === 0
        ? faceValue
        : getDefaultFaceValue(poolLimit);

    if (safeFaceValue !== faceValue) {
      setValue('faceValue', safeFaceValue, { shouldValidate: true, shouldDirty: true });
    }
  }, [faceValue, poolLimit, setValue]);

  useEffect(() => {
    if (!faceValue || !poolLimit) return;

    const nextMinInvestment = clampValue(
      minInvestment || faceValue,
      faceValue,
      poolLimit
    );

    if (nextMinInvestment % faceValue !== 0) {
      const roundedMinInvestment = Math.ceil(nextMinInvestment / faceValue) * faceValue;
      setValue('minInvestment', Math.min(roundedMinInvestment, poolLimit), {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }

    if (nextMinInvestment !== minInvestment) {
      setValue('minInvestment', nextMinInvestment, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [faceValue, minInvestment, poolLimit, setValue]);

  useEffect(() => {
    if (!faceValue || !totalUnits || !minUnits) return;

    const nextMaxPtc = clampValue(
      maxPtc || getSuggestedMaxPtc(totalUnits),
      Math.max(1, Math.ceil(minUnits)),
      totalUnits
    );

    if (nextMaxPtc !== maxPtc) {
      setValue('maxPtc', nextMaxPtc, { shouldValidate: true, shouldDirty: true });
    }
  }, [faceValue, maxPtc, minUnits, setValue, totalUnits]);

  useEffect(() => {
    if (!totalUnits || !minUnits) return;

    const nextMaxInvestPool = getSuggestedMaxInvestPool(totalUnits, minUnits);

    if (nextMaxInvestPool !== maxInvestPool) {
      setValue('maxInvestPool', nextMaxInvestPool, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [maxInvestPool, minUnits, setValue, totalUnits]);

  const onSubmit = async (data) => {
    saveStepData({
      ...data,
      poolLimit,
      totalUnits,
      minUnits,
      maxInvestment,
      allocatedUnits,
    });
    setActiveStepId('legal_structure');
  };

  return (
    <Container>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Card
          sx={{
            p: 4,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h5" color="primary">
              PTC Parameters
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Configure Pass Through Certificate structure using the pool limit as the base.
            </Typography>
          </Stack>

          <Typography variant="subtitle1" color="primary" sx={{ mb: 2, display: 'block' }}>
            PTC Unit Structure
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <RHFTextField
                type="number"
                name="faceValue"
                label="Face Value per PTC Unit (₹)"
                fullWidth
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Pool Limit {formatCurrency(poolLimit)} • Total Units {totalUnits.toLocaleString('en-IN')}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField
                type="number"
                name="minInvestment"
                label="Min Investment per Investor (₹)"
                fullWidth
              />
              <Typography variant="caption" color="text.secondary">
                Minimum Units = {Number.isInteger(minUnits) ? minUnits.toLocaleString('en-IN') : minUnits}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField
                type="number"
                name="maxPtc"
                label="Max Units per Investor"
                fullWidth
              />
              <Typography variant="caption" color="text.secondary">
                Minimum {Math.ceil(minUnits || 0).toLocaleString('en-IN')} units • Maximum {totalUnits.toLocaleString('en-IN')} units
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField
                type="number"
                name="maxInvestPool"
                label="Max Investors per Pool"
                fullWidth
              />
              <Typography variant="caption" color="text.secondary">
                Based on minimum units: {allocatedUnits.toLocaleString('en-IN')} / {totalUnits.toLocaleString('en-IN')} units
              </Typography>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" color="primary" sx={{ mb: 2, mt: 2, display: 'block' }}>
            Investor Liquidity Window
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <RHFSelect name="windowFrequency" label="Window Frequency">
                {Window_Frequency.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <Typography variant="caption" color="text.secondary">
                For 30-day maturity: windows at Day 7, 14, 21, 30
              </Typography>
            </Grid>
          </Grid>


          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || !poolLimit}>
              Next
            </Button>
          </Box>
        </Card>
      </FormProvider>
    </Container>
  );
}

PtcParameters.propTypes = {
  currData: PropTypes.any,
  percent: PropTypes.func,
  poolData: PropTypes.any,
  saveStepData: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
};
