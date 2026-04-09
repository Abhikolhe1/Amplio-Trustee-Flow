import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import { Box, Button, Card, Grid, MenuItem, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// ----------------------------------------------------------------------

const SPV_OPTIONS = [
  {
    label: 'Standalone Passive Vehicle',
    value: 'standalone',
  },
  {
    label: 'Master Trust Structure',
    value: 'trust',
  },
  {
    label: 'Pooled Vehicle Trust',
    value: 'llp',
  },
];
const PSP_PARTNER = [
  {
    label: 'Razorpay',
    value: 'razorpay',
  },
  {
    label: 'Paytm',
    value: 'paytm',
  },
  {
    label: 'PhonePe Business',
    value: 'phonepe',
  },
  {
    label: 'Cashfree',
    value: 'cashfree',
  },
];

export default function BasicInfo({ percent, setActiveStepId, currData, saveStepData }) {
  const [spvCounter, setSpvCounter] = useState(1);

  const FormSchema = Yup.object().shape({
    pspPartner: Yup.string().required('PSP Partner is required'),
    spvStructure: Yup.string()
      .required('SPV Legal Structure is required')
      .notOneOf([''], 'Please select SPV structure'),
    originator: Yup.string().required('Originator is required'),
    spvName: Yup.string().required('SPV Name is required'),
  });

  const defaultValues = useMemo(
    () => ({
      pspPartner: currData?.pspPartner || '',
      spvStructure: currData?.spvStructure || '',
      originator: currData?.originator || '',
      spvName: currData?.spvName || '',
    }),
    [currData]
  );

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const requiredFields = ['pspPartner', 'spvStructure', 'originator', 'spvName'];

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
  }, [values.pspPartner, values.spvStructure, values.originator, values.spvName]);

  const generateSPVName = () => {
    const formattedId = `SPV-${String(spvCounter).padStart(3, '0')}`;

    setValue('spvName', formattedId);

    setSpvCounter((prev) => prev + 1);
  };

  const onSubmit = async (data) => {
    saveStepData(data);
    console.log(data);
    setActiveStepId('pool_financial');
  };
  useEffect(() => {
    if (currData) {
      reset(defaultValues);
    }
  }, [defaultValues, currData, reset]);

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
            <Typography variant="h5" color="primary">
              Basic Info & PSP Linking
            </Typography>

            <Typography variant="body2">
              Establish the PSP partner, settlement bucket, SPV legal structure, and associate
              merchant accounts for this vehicle.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <RHFSelect name="pspPartner" label="PSP PARTNER" fullWidth sx={{ mt: 1 }}>
                {PSP_PARTNER.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                ✓ Razorpay API verified and active
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFSelect name="spvStructure" label="SPV LEGAL STRUCTURE" fullWidth sx={{ mt: 1 }}>
                {SPV_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <Typography variant="caption">
                T1 pools — Standalone Passive Vehicle recommended
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFTextField
                name="originator"
                placeholder="FinFlow Capital Pvt. Ltd. (NBFC)"
                label="ORIGINATOR (PLATFORM NBFC)"
                fullWidth
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                ✓ RBI NBFC-ICC Reg. No. N-14.03292
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <RHFTextField
                  name="spvName"
                  placeholder="SPV-001"
                  label="AUTO-GENERATED SPV NAME"
                  fullWidth
                />
                <Box alignContent="center">
                  <Button
                    variant="outlined"
                    color="primary"
                    borderColor="primary"
                    minWidth="95"
                    size="medium"
                    onClick={generateSPVName}
                  >
                    Regen
                  </Button>
                </Box>
              </Stack>

              <Typography variant="caption">
                Format: [PSP]-[Bucket]-[Year]-[Version]-[Hash]
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

BasicInfo.propTypes = {
  currData: PropTypes.any,
  percent: PropTypes.func,
  saveStepData: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
};
