import * as Yup from 'yup';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import FormProvider, {
  RHFCustomFileUploadBox,
  RHFSelect,
  RHFTextField,
} from 'src/components/hook-form';
// import { DatePicker } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';
import { useSnackbar } from 'src/components/snackbar';
import RHFDatePicker from 'src/components/hook-form/rhf-date-picker';
import axiosInstance from 'src/utils/axios';
import { useParams } from 'src/routes/hook';

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

// hasuploaded function
const hasUploadedFile = (value) => {
  if (!value) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'string') {
    return Boolean(value.trim());
  }

  return true;
};

const getMediaId = (value) => (typeof value === 'string' ? value : value?.id || '');

export default function IssuanceDetails({
  selectedDepository,
  creditAgecyWithRating,
  issueSize,
  currData,
  percent,
  saveStepData,
  setActiveStepId,
}) {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const securityType = [
    { value: 'secure', label: 'Secure' },
    { value: 'unsecure', label: 'Unsecure' },
  ];

  const issuanceSchema = Yup.object({
    securityType: Yup.string().required('Security Type is required'),
    isinNumber: Yup.string()
      .required('ISIN is required')
      .transform((value) => value?.trim().toUpperCase())
      .matches(/^IN[A-Z0-9]{9}[0-9]$/, 'Invalid Indian ISIN, (e.g. INE123A01016 / IN1234567890'),
    issueSize: Yup.string().required(' Issue size is required'),
    // issueSize: Yup.number().typeError('Must be a number').required('Issue Size is required'),
    issueDate: Yup.date().nullable().required('Issue Date is required'),
    creditRating: Yup.string().required('Credit Rating is required'),
    isisnLetterDoc: Yup.mixed()
      .required('File is required')
      .test('fileRequired', 'ISIN Letter is required', (value) => hasUploadedFile(value)),
  });

  const defaultValues = {
    isinNumber: currData?.isinNumber || '',
    securityType: currData?.securityType || 'secure',
    issueSize: issueSize ?? currData?.issueSize ?? '',
    issueDate: currData?.issueDate ? new Date(currData.issueDate) : null,
    creditRating: creditAgecyWithRating || currData?.creditRating || '',
    isisnLetterDoc: currData?.isinLetterDoc || currData?.isinLetterDocId || currData?.isisnLetterDoc || null,
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        depositoryId: selectedDepository,
        securityType: data.securityType,
        isinNumber: data.isinNumber,
        issueSize: String(data.issueSize),
        issueDate: data.issueDate?.toISOString?.() || data.issueDate,
        creditRating: data.creditRating,
        isinLetterDocId: getMediaId(data.isisnLetterDoc),
      };
      const res = await axiosInstance.patch(`/spv-pre/isin-application/${id}`, payload);
      const isinApplication = res?.data?.details?.isinApplication || payload;

      saveStepData({
        ...isinApplication,
        depositoryId: selectedDepository,
      });
      enqueueSnackbar('Data Saved Successfully', { variant: 'success' });
      setActiveStepId('review_and_Activate');
    } catch (error) {
      enqueueSnackbar('Failed to save data', { variant: 'error' });
      throw error;
    }
  });

  useEffect(() => {
    reset({
      securityType: currData?.securityType || 'secure',
      isinNumber: currData?.isinNumber || '',
      issueSize: issueSize ?? currData?.issueSize ?? '',
      creditRating: creditAgecyWithRating || currData?.creditRating || '',
      issueDate: currData?.issueDate ? new Date(currData.issueDate) : null,
      isisnLetterDoc: currData?.isinLetterDoc || currData?.isinLetterDocId || currData?.isisnLetterDoc || null,
    });
  }, [creditAgecyWithRating, currData, issueSize, reset]);

  useEffect(() => {
    // sessionStorage.setItem('issuanceDetails', JSON.stringify(values));
    const progress = calculateFormProgress(values);
    percent(progress);
  }, [percent, values]);

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
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFTextField name="isinNumber" label="ISIN Number" />
              {/* <Typography variant="caption" color="text.secondary">
                All Indian securities start with INE
              </Typography> */}
            </Grid>
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
          <Box
            mt={2}
            columnGap={2}
            rowGap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(1, 1fr)',
            }}
          >
            <RHFCustomFileUploadBox
              name="isisnLetterDoc"
              label="Upload ISIN Application Leter (PDF)"
              // disabled={disabled}
              control={control}
              accept={{
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
                  '.docx',
                ],
              }}
            />
          </Box>

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
