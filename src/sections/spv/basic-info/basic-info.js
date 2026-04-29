import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import {
  Box,
  Button,
  Card,
  Grid,
  MenuItem,
  Stack,
  Typography,
  InputAdornment,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetSpvApplicationStepData } from 'src/api/spvApplication';
import { useParams } from 'src/routes/hook';
import axiosInstance from 'src/utils/axios';
import { useGetPsp } from 'src/api/psp-master';

// ----------------------------------------------------------------------

const SPV_OPTIONS = [
  {
    label: 'Standalone Passive Vehicle',
    value: 'Standalone Passive Vehicle',
  },
  {
    label: 'Master Trust Structure',
    value: 'Master Trust Structure',
  },
  {
    label: 'Pooled Vehicle Trust',
    value: 'Pooled Vehicle Trust',
  },
];

export default function BasicInfo({ percent, setActiveStepId, saveStepData, isReadOnly }) {
  const params = useParams();
  const { id } = params;
  const [spvCounter, setSpvCounter] = useState(1);
  const { psp = [] } = useGetPsp();

  const { stepData } = useGetSpvApplicationStepData(id, 'spv_basic_info');
  const [currData, setCurrData] = useState();

  const FormSchema = Yup.object().shape({
    pspPartner: Yup.string().required('PSP Partner is required'),
    legalStructure: Yup.string()
      .required('SPV Legal Structure is required')
      .notOneOf([''], 'Please select SPV structure'),
    originatorName: Yup.string().required('Originator is required'),
    spvName: Yup.string().required('SPV Name is required'),
  });

  const defaultValues = useMemo(
    () => ({
      pspPartner: currData?.pspMaster?.id || currData?.pspMasterId || currData?.pspPartner || '',
      legalStructure: currData?.legalStructure || '',
      originatorName: currData?.originatorName || 'Birbal Plus',
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

  const requiredFields = ['pspPartner', 'legalStructure', 'originatorName', 'spvName'];

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
  }, [values.pspPartner, values.legalStructure, values.originatorName, values.spvName]);

  const generateSPVName = () => {
    const selectedPsp = psp.find((item) => String(item.id) === String(watch('pspPartner')));

    const getPspCode = (name = '') =>
      name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 4) || 'GEN';

    const pspCode = getPspCode(selectedPsp?.name);
    const year = new Date().getFullYear();
    const version = `V${spvCounter}`;
    const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
    const formattedId = `${pspCode}-${year}-${version}-${hash}`;

    setValue('spvName', formattedId);
    setSpvCounter((prev) => prev + 1);
  };

  const onSubmit = async (data) => {
    try {
      const { pspPartner, ...restData } = data;
      const payload = {
        ...restData,
        pspMasterId: pspPartner,
      };

      await axiosInstance.patch(`/spv-pre/basic-info/${id}`, payload);
      saveStepData?.(payload);
      setActiveStepId('pool_financials');
    }
    catch (error) {
      console.log(error.error.message);
    }
  };

  useEffect(() => {
    if (stepData) {
      setCurrData(stepData);
    }
  }, [stepData]);

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
              <RHFSelect name="pspPartner" label="PSP PARTNER" InputProps={{
                readOnly: isReadOnly
              }} fullWidth sx={{ mt: 1 }}>
                {psp.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFSelect name="legalStructure" label="SPV LEGAL STRUCTURE" InputProps={{
                readOnly: isReadOnly
              }} fullWidth sx={{ mt: 1 }}>
                {SPV_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFTextField
                name="originatorName"
                label="ORIGINATOR (PLATFORM NBFC)"
                fullWidth
                InputProps={{
                  readOnly: isReadOnly
                }}
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFTextField
                name="spvName"
                placeholder="SPV-001"
                label="AUTO-GENERATED SPV NAME"
                fullWidth

                sx={{ mt: 1 }}
                InputProps={{
                  readOnly: isReadOnly,


                  endAdornment: (
                    <InputAdornment position="end">
                      {!isReadOnly && (
                        <Button
                          variant="text"
                          color="primary"
                          onClick={generateSPVName}
                          sx={{
                            minWidth: 'auto',
                            px: 1,
                            fontWeight: 600,
                            bgcolor: (theme) => theme.palette.primary.lighter,
                            border: (theme) => `1px solid ${theme.palette.primary.main}`,
                            borderRadius: 1,
                          }}
                        >
                          Regen
                        </Button>
                      )}
                    </InputAdornment>
                  ),
                }}

              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                {!isReadOnly && (
                  <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                    Next
                  </Button>)}
              </Box>
            </Grid>
          </Grid>
        </Card>
      </FormProvider>
    </Container>
  );
}

BasicInfo.propTypes = {
  currData: PropTypes.any,
  percent: PropTypes.func,
  saveStepData: PropTypes.func,
  setActiveStepId: PropTypes.func.isRequired,
};
