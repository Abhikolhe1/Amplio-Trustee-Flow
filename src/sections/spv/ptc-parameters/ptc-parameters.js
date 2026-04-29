import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import { Box, Button, Card, Grid, MenuItem, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetPoolFinancial, useGetSpvApplicationStepData } from 'src/api/spvApplication';
import axiosInstance from 'src/utils/axios';
import { useParams } from 'src/routes/hook';

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

const getTotalUnits = (poolLimit, faceValuePerUnit) => {
  if (!poolLimit || !faceValuePerUnit || poolLimit % faceValuePerUnit !== 0) {
    return 0;
  }

  return poolLimit / faceValuePerUnit;
};

const getMinUnits = (minInvestment, faceValuePerUnit) => {
  if (!minInvestment || !faceValuePerUnit) {
    return 0;
  }

  return minInvestment / faceValuePerUnit;
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

export default function PtcParameters({ percent, saveStepData, setActiveStepId, isReadOnly }) {
  const params = useParams();
  const { id } = params;
  const { stepData, stepDataLoading } = useGetSpvApplicationStepData(id, 'ptc_parameters');
  console.log('application', stepData);
  const [currData, setCurrData] = useState();
  const { application } = useGetPoolFinancial(id);
  // console.log('application', application);

  const [prevPoolData, setPrevPoolData] = useState({});
  // console.log(prevPoolData);
  const theme = useTheme();
  const poolLimit = toPositiveInteger(prevPoolData?.poolLimit);

  // {
  //   "faceValuePerUnit": 0,
  //   "minInvestment": 0,
  //   "maxUnitsPerInvestor": 0,
  //   "maxInvestors": 0,
  //   "windowFrequency": "string",
  //   "windowDurationHours": 0
  // }

  const FormSchema = useMemo(
    () =>
      Yup.object().shape({
        faceValuePerUnit: Yup.number()
          .typeError('Face value is required')
          .integer('Face value must be a whole number')
          .min(MIN_FACE_VALUE, `Face value must be at least ${formatCurrency(MIN_FACE_VALUE)}`)
          .test(
            'max-limit',
            `Face value cannot exceed pool limit (${formatCurrency(poolLimit)})`,
            (value) => {
              if (!value || !poolLimit) return false;
              return value <= poolLimit;
            }
          )
          .test(
            'faceValuePerUnit-divides-pool',
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
          .min(Yup.ref('faceValuePerUnit'), 'Minimum investment must be at least one PTC unit')
          .max(poolLimit || Number.MAX_SAFE_INTEGER, 'Minimum investment cannot exceed pool limit')
          .test(
            'minInvestment-multiple',
            'Minimum investment must be a multiple of face value',
            function validateMinInvestment(value) {
              const faceValuePerUnit = Number(this.parent.faceValuePerUnit);

              if (!value || !faceValuePerUnit) return false;
              return value % faceValuePerUnit === 0;
            }
          )
          .required('Minimum investment is required'),
        maxUnitsPerInvestor: Yup.number()
          .typeError('Max PTC is required')
          .integer('Max PTC must be a whole number')
          .test(
            'maxPtc-minUnits',
            'Max PTC must be at least minimum units',
            function validateMaxPtc(value) {
              const faceValuePerUnit = Number(this.parent.faceValuePerUnit);
              const minInvestment = Number(this.parent.minInvestment);
              const totalUnits = getTotalUnits(poolLimit, faceValuePerUnit);
              const minUnits = getMinUnits(minInvestment, faceValuePerUnit);

              if (!value || !faceValuePerUnit || !minInvestment || !totalUnits) return false;
              return value >= minUnits && value <= totalUnits;
            }
          )
          .required('Max PTC is required'),
        maxInvestors: Yup.number()
          .typeError('Max investors required')
          .integer('Max investors must be a whole number')
          .min(1, 'Max investors must be at least 1')
          .test(
            'maxInvestors-totalUnits',
            'Max investors cannot exceed total units or over-allocate the pool',
            function validateMaxInvestPool(value) {
              const faceValuePerUnit = Number(this.parent.faceValuePerUnit);
              const minInvestment = Number(this.parent.minInvestment);
              const totalUnits = getTotalUnits(poolLimit, faceValuePerUnit);
              const minUnits = getMinUnits(minInvestment, faceValuePerUnit);

              if (!value || !faceValuePerUnit || !minInvestment || !totalUnits || !minUnits)
                return false;
              return value <= totalUnits && value * minUnits <= totalUnits;
            }
          )
          .required('Max investors required'),
        windowFrequency: Yup.string().required('Select frequency'),
        windowDurationHours: Yup.number().required('Window duration required'),
      }),
    [poolLimit]
  );

  const defaultValues = useMemo(() => {
    const faceValuePerUnit =
      toPositiveInteger(currData?.faceValuePerUnit) || getDefaultFaceValue(poolLimit);
    const totalUnits = getTotalUnits(poolLimit, faceValuePerUnit);
    const minInvestment = toPositiveInteger(currData?.minInvestment) || faceValuePerUnit;
    const minUnits = getMinUnits(minInvestment, faceValuePerUnit);
    const maxUnitsPerInvestor =
      toPositiveInteger(currData?.maxUnitsPerInvestor) || getSuggestedMaxPtc(totalUnits);
    const maxInvestors =
      toPositiveInteger(currData?.maxInvestors) || getSuggestedMaxInvestPool(totalUnits, minUnits);

    return {
      faceValuePerUnit,
      minInvestment,
      maxUnitsPerInvestor,
      maxInvestors,
      windowFrequency: currData?.windowFrequency || '7',
      windowDurationHours: 24,
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
  const faceValuePerUnit = toPositiveInteger(values.faceValuePerUnit);
  const minInvestment = toPositiveInteger(values.minInvestment);
  const totalUnits = getTotalUnits(poolLimit, faceValuePerUnit);
  const minUnits = getMinUnits(minInvestment, faceValuePerUnit);
  const maxUnitsPerInvestor = toPositiveInteger(values.maxUnitsPerInvestor);
  const maxInvestment =
    faceValuePerUnit && maxUnitsPerInvestor ? faceValuePerUnit * maxUnitsPerInvestor : 0;
  const maxInvestors = toPositiveInteger(values.maxInvestors);
  const allocatedUnits = minUnits && maxInvestors ? minUnits * maxInvestors : 0;

  const requiredFields = [
    'faceValuePerUnit',
    'minInvestment',
    'maxUnitsPerInvestor',
    'maxInvestors',
    'windowFrequency',
  ];

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
  }, [
    values.faceValuePerUnit,
    values.minInvestment,
    values.maxUnitsPerInvestor,
    values.maxInvestors,
    values.windowFrequency,
  ]);

  useEffect(() => {
    if (stepData) {
      setCurrData(stepData);
    }
  }, [stepData])

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!poolLimit || !faceValuePerUnit) return;

    if (faceValuePerUnit > poolLimit) {
      setValue('faceValuePerUnit', poolLimit, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [faceValuePerUnit, poolLimit, setValue]);

  useEffect(() => {
    if (!faceValuePerUnit || !poolLimit) return;

    // Always recompute fresh
    let nextMinInvestment = faceValuePerUnit;

    // Ensure it's multiple of faceValue (already is)
    // Clamp to pool limit
    nextMinInvestment = Math.min(nextMinInvestment, poolLimit);

    if (nextMinInvestment !== minInvestment) {
      setValue('minInvestment', nextMinInvestment, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [faceValuePerUnit, poolLimit, setValue]);

  useEffect(() => {
    if (!faceValuePerUnit || !totalUnits || !minUnits) return;

    const nextMaxPtc = clampValue(
      getSuggestedMaxPtc(totalUnits),
      Math.max(1, Math.ceil(minUnits)),
      totalUnits
    );

    setValue('maxUnitsPerInvestor', nextMaxPtc, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [faceValuePerUnit, totalUnits, minUnits, setValue]);

  useEffect(() => {
    if (!totalUnits || !minUnits) return;

    const nextMaxInvestPool = getSuggestedMaxInvestPool(totalUnits, minUnits);

    setValue('maxInvestors', nextMaxInvestPool, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [totalUnits, minUnits, setValue]);

  useEffect(() => {
    if (application) {
      setPrevPoolData(application);
    }
  }, [application]);

  const onSubmit = async (data) => {
    // const payload = {
    //   faceValuePerUnit: data.faceValuePerUnit,
    //   minInvestment: data.minInvestment,
    //   maxUnitsPerInvestor: data.maxUnitsPerInvestor,
    //   maxInvestors: data.maxInvestors,
    //   windowFrequency: data.windowFrequency,
    //   windowDurationHours: 24,
    // };

    await axiosInstance.patch(`/spv-pre/ptc-parameters/${id}`, data);
    saveStepData?.(data);
    setActiveStepId('trust_deed');
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
                name="faceValuePerUnit"
                label="Face Value per PTC Unit (₹)"
                fullWidth
                inputProps={{
                  min: MIN_FACE_VALUE,
                  max: poolLimit || undefined,
                  readOnly: isReadOnly,

                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                Pool Limit {formatCurrency(poolLimit)} • Total Units{' '}
                {totalUnits.toLocaleString('en-IN')}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField
                type="number"
                name="minInvestment"
                label="Min Investment per Investor (₹)"
                fullWidth
                inputProps={{
                  readOnly: isReadOnly,

                }}
              />
              <Typography variant="caption" color="text.secondary">
                Minimum Units ={' '}
                {Number.isInteger(minUnits) ? minUnits.toLocaleString('en-IN') : minUnits}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField
                type="number"
                name="maxUnitsPerInvestor"
                label="Max Units per Investor"
                fullWidth
                inputProps={{
                  readOnly: isReadOnly,

                }}
              />
              <Typography variant="caption" color="text.secondary">
                Minimum {Math.ceil(minUnits || 0).toLocaleString('en-IN')} units • Maximum{' '}
                {totalUnits.toLocaleString('en-IN')} units
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField
                type="number"
                name="maxInvestors"
                label="Max Investors per Pool"
                fullWidth
                inputProps={{
                  readOnly: isReadOnly,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Based on minimum units: {allocatedUnits.toLocaleString('en-IN')} /{' '}
                {totalUnits.toLocaleString('en-IN')} units
              </Typography>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" color="primary" sx={{ mb: 2, mt: 2, display: 'block' }}>
            Investor Liquidity Window
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <RHFSelect name="windowFrequency" label="Window Frequency" inputProps={{
                readOnly: isReadOnly,

              }}>
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
            <Grid item xs={12} md={6}>
              <RHFTextField
                type="number"
                name="windowDurationHours"
                label="Window Duration (hours)"
                inputProps={{
                  readOnly: isReadOnly,
                }}
              />
            </Grid>
          </Grid>

          {!isReadOnly && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || !poolLimit}
              >
                Next
              </Button>
            </Box>
          )}
        </Card>
      </FormProvider>
    </Container>
  );
}

PtcParameters.propTypes = {
  currData: PropTypes.any,
  percent: PropTypes.func,
  poolData: PropTypes.any,
  saveStepData: PropTypes.func,
  setActiveStepId: PropTypes.func.isRequired,
};
