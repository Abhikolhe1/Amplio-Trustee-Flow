import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo } from 'react';
import Container from '@mui/material/Container';
import { Box, Button, Card, Grid, MenuItem, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFSelect, RHFTextField, } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';
import { yupResolver } from '@hookform/resolvers/yup';

// ----------------------------------------------------------------------

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

export default function PtcParameters({ percent, setActiveStepId, currData, saveStepData }) {
  const theme = useTheme();

  const FormSchema = Yup.object().shape({
    faceValue: Yup.string().required('Face value is required'),
    // maxInvest: Yup.string().required('Min investment is required'),
    maxPtc: Yup.string().required('Max PTC is required'),
    maxInvestPool: Yup.string().required('Max investors required'),
    windowFrequency: Yup.string().required('Select frequency'),
    windowDuration: Yup.string().required('Duration required'),
  });

  const defaultValues = useMemo(() => ({
    faceValue: currData?.faceValue || '',
    // maxInvest: currData?.maxInvest || '',
    maxPtc: currData?.maxPtc || '',
    maxInvestPool: currData?.maxInvestPool || '',
    windowFrequency: currData?.windowFrequency || '',
    windowDuration: currData?.windowDuration || '',
  }), [currData]);

  const methods = useForm({
    resolver: yupResolver(FormSchema),
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

  useEffect(() => {
    const totalFields = 5;
    let filledFields = 0;

    if(values.faceValue !== '') filledFields +=1;
    // if(values.maxInvest) filledFields +=1;
    if(values.maxPtc !== '') filledFields +=1;
    if(values.maxInvestPool !== '') filledFields +=1;
    if(values.windowFrequency !== '') filledFields +=1;
    if(values.windowDuration !== '') filledFields +=1;

    const progressPercent = Math.round((filledFields / totalFields) * 100);
    percent(progressPercent);
  },[values, percent]);

  const onSubmit = async (data) => {
    saveStepData(data);
    console.log('FORM DATA:', data);
    setActiveStepId('legal_structure');
  };

  useEffect(() => {
    if (currData){
      reset(defaultValues);
    }
  },[defaultValues, currData, reset]);

  return (
    <Container>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Card
          sx={{
            p: 4,
            borderRadius: 3,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h5" color="primary" fontWeight={600}>
              PTC Parameters
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Configure Pass Through Certificate structure — unit pricing, investor limits, and
              liquidity window settings.
            </Typography>
          </Stack>

          <Typography variant="overline" color="text.primary" sx={{ mb: 2, display: 'block' }}>
            PTC Unit Structure
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <RHFTextField
                type="number"
                name="faceValue"
                label="Face Value per PTC Unit (₹)"
                placeholder="82"
                fullWidth
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="text.primary" sx={{ mt: 0.5, display: 'block' }}>
                At ₹50L pool limit → max 5,00,000 units
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <RHFTextField
                  type="number"
                  name="maxInvest"
                  label="Min Investment per Investor (₹)"
                  fullWidth
                  disabled
                />
              </Stack>
              <Typography variant="caption" color="text.primary">
                = 100 PTC units minimum
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <RHFTextField
                  type="number"
                  placeholder="10000"
                  name="maxPtc"
                  label="Max PTCs per Investor (units)"
                  fullWidth
                />
              </Stack>
              <Typography variant="caption" color="text.primary">
                Cap: ₹10,00,000 per investor
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <RHFTextField
                  type="number"
                  placeholder="200"
                  name="maxInvestPool"
                  label="Max Investors per Pool"
                  fullWidth
                />
              </Stack>
            </Grid>
          </Grid>

          <Box padding={3}>
            <Box
              padding={2}
              sx={{
                borderRadius: 2,
                bgcolor: (theme) => theme.palette.warning.lighter,
                border: (theme) => `1px solid ${theme.palette.warning.main}`,
              }}
            >
              <Typography variant="subtitle1" color="warning.main">
                PTC Investment Rules
                <span style={{ fontSize: '16px', marginLeft: '8px'}}> ✔</span>
              </Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Configure investment unit pricing, investor participation limits, reinvestment
                preferences, and liquidity access for the Pass Through Certificate pool.
              </Typography>
            </Box>
          </Box>

          <Typography variant="overline" sx={{ mb: 2, display: 'block' }}>
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

              <Typography variant="caption">
                For 30-day maturity: windows at Day 7, 14, 21, 30
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField
                type="number"
                name="windowDuration"
                label="Window Duration (hours)"
                fullWidth
              />
              <Typography variant="caption">
                Time window for investor exit/reinvest decision
              </Typography>
            </Grid>
          </Grid>
        </Card>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              Next
            </Button>
          </Box>
      </FormProvider>
    </Container>
  );
}

PtcParameters.propTypes = {
  currData: PropTypes.any,
  percent: PropTypes.func,
  saveStepData: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
};
