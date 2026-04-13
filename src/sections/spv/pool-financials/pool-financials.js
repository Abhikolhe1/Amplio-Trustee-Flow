import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
import Container from '@mui/material/Container';
import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import FormProvider, { RHFSlider, RHFSwitch, RHFTextField } from 'src/components/hook-form';

// components
import { yupResolver } from '@hookform/resolvers/yup';
import WidgetSummaryCard from 'src/components/card/widget-summary-card';
import { TimePicker } from '@mui/x-date-pickers';
// ----------------------------------------------------------------------

export default function PoolFinancials({ percent, setActiveStepId, currData, saveStepData }) {
  const sliderStyle = {
    height: 8,
    '& .MuiSlider-track': {
      height: 8,
      borderRadius: 4,
    },
    '& .MuiSlider-rail': {
      height: 8,
      borderRadius: 4,
      opacity: 0.3,
    },
    '& .MuiSlider-thumb': {
      width: 20,
      height: 20,
    },
  };

  function formatNumber(num) {
    const number = Number(num);

    if (number >= 10000000) {
      return `${(number / 10000000).toFixed(2)} Cr`;
    }
    if (number >= 100000) {
      return `${(number / 100000).toFixed(2)} L`;
    }
    if (number >= 1000) {
      return `${(number / 1000).toFixed(2)} K`;
    }
    return number;
  }

  const basic = currData?.basic_info;

  const spvName = basic?.spvName || 'T1 SPV';

  const PoolSchema = Yup.object().shape({
    poolLimit: Yup.string().required('Pool limit is required'),
    maturity: Yup.string().required('Maturity is required'),
    targetYield: Yup.string().required('Target Yield is required'),
    reserveBuffer: Yup.string().required('Reserve Buffer is required'),
    cutoffTime: Yup.mixed().required('Cutoff time required'),
  });
  const pool = currData?.pool_financial;

  const defaultValues = useMemo(
    () => ({
      poolLimit: pool?.poolLimit ?? 1000000,
      maturity: pool?.maturity ?? 30,
      targetYield: pool?.targetYield ?? 6,
      reserveBuffer: pool?.reserveBuffer ?? 0.5,
      cutoffTime: pool?.cutoffTime ? new Date(pool.cutoffTime) : null,
    }),
    [pool]
  );

  const methods = useForm({
    resolver: yupResolver(PoolSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const requiredFields = ['poolLimit', 'maturity', 'targetYield', 'reserveBuffer', 'cutoffTime'];

  useEffect(() => {
    let completed = 0;

    requiredFields.forEach((field) => {
      if (Array.isArray(values[field]) && values[field]?.length > 0) {
        completed += 1;
      }

      if (values[field] && !Array.isArray(values[field])) {
        completed += 1;
      }
    });

    const percentValue = (completed / requiredFields.length) * 100;
    percent?.(percentValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    values.poolLimit,
    values.maturity,
    values.targetYield,
    values.reserveBuffer,
    values.cutoffTime,
  ]);

  const onSubmit = async (data) => {
    saveStepData(data);
    console.log('FORM DATA:', data);
    setActiveStepId('ptc_parameters');
  };

  useEffect(() => {
    if (currData) {
      reset(defaultValues);
    }
  }, [defaultValues, currData, reset]);

  return (
    <Container>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" color="primary" mb={1}>
                Pool Financial Configuration
              </Typography>
              <Typography variant="body2">
                Set the pool limit, maturity, yield, discount range, reserve buffer, and daily
                cutoff time for the <strong>{spvName}</strong>.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <WidgetSummaryCard
                title="Pool Limit"
                total={`₹${formatNumber(values.poolLimit || 0)}`}
                timing="Maximum capacity"
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <WidgetSummaryCard
                title="Maturity"
                total={`${values.maturity || 0} days`}
                timing="Per PTC cycle"
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <WidgetSummaryCard
                title="Target Yield"
                total={`${values.targetYield || 0} %`}
                timing="p.a. to investors"
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <WidgetSummaryCard
                title="Reserve Buffer"
                total={`${values.reserveBuffer || 0} %`}
                timing="₹1,00,000 required"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary">
                Pool Parameters
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={0.5}>
                <Typography variant="body2">Pool Limit (₹)</Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">₹10L</Typography>
                  <Typography variant="caption">₹5Cr</Typography>
                </Stack>

                <RHFSlider
                  name="poolLimit"
                  min={1000000}
                  max={50000000}
                  step={100000}
                  sx={sliderStyle}
                  valueLabelFormat={(value) => `₹${formatNumber(value)}`}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={0.5}>
                <Typography variant="body2">Maturity (Days)</Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">30d</Typography>
                  <Typography variant="caption">120d</Typography>
                </Stack>

                <RHFSlider
                  name="maturity"
                  min={30}
                  max={120}
                  step={1}
                  sx={sliderStyle}
                  valueLabelFormat={(value) => `${formatNumber(value)} days`}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={0.5}>
                <Typography variant="body2">Target Investor Yield (% p.a.)</Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">6%</Typography>
                  <Typography variant="caption">20%</Typography>
                </Stack>

                <RHFSlider
                  name="targetYield"
                  min={6}
                  max={20}
                  step={0.1}
                  sx={sliderStyle}
                  valueLabelFormat={(value) => `${formatNumber(value)} %`}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={0.5}>
                <Typography variant="body2">Reserve / Credit Enhancement Buffer (%)</Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">0.5%</Typography>
                  <Typography variant="caption">10%</Typography>
                </Stack>

                <RHFSlider
                  name="reserveBuffer"
                  min={0.5}
                  max={10}
                  step={0.1}
                  sx={sliderStyle}
                  valueLabelFormat={(value) => `${formatNumber(value)} %`}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="cutoffTime"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TimePicker
                    label="Cutoff Time"
                    color="primary"
                    value={field.value || null}
                    onChange={(newValue) => field.onChange(newValue)}
                    ampm={false}
                    slotProps={{
                      actionBar: {
                        actions: ['accept'],
                      },
                      textField: {
                        fullWidth: true,
                        margin: 'normal',
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary">
                Time window for investor exit/reinvest decision
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              Next
            </Button>
          </Box>
        </Card>
      </FormProvider>
    </Container>
  );
}

PoolFinancials.propTypes = {
  currData: PropTypes.any,
  percent: PropTypes.func,
  saveStepData: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
};
