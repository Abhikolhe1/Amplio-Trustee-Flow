import { yupResolver } from '@hookform/resolvers/yup';

import { Alert, Button, Card, Grid, MenuItem, Tooltip, Typography } from '@mui/material';
import { alpha, Box, Container, Stack } from '@mui/system';
import { Controller, useForm } from 'react-hook-form';
import FormProvider, {
  RHFCustomFileUploadBox,
  RHFSelect,
  RHFTextField,
} from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import PropTypes from 'prop-types';

import * as yup from 'yup';
import { useEffect, useMemo } from 'react';
import RHFDatePicker from 'src/components/hook-form/rhf-date-picker';


const normalizeDate = (value) => {
  if (!value) {
    return null;
  }

  const parsedDate = value instanceof Date ? value : new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

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

function CreditRating({ disabled, currData, percent, saveStepData, setActiveStepId }) {
  const CardData = [
    { heading: 'CRISIL', subHeading: 'CRISIL Ltd. (S&P Global)' },
    { heading: 'ICRA', subHeading: "ICRA Ltd. (Moody's)" },
    { heading: 'CARE', subHeading: 'CARE Ratings Ltd.' },
    { heading: 'Brickwork', subHeading: 'Brickwork Ratings India' },
    { heading: 'India Ratings', subHeading: 'India Ratings and Research' },
    { heading: 'Acuité', subHeading: 'Acuité Ratings & Research' },
    { heading: 'Infomerics', subHeading: 'Infomerics Valuation and Rating Pvt Ltd.' }
  ];

  const category = [
    'pending- Awaiting CRISIL Review',
    'AA+ (sf)- Excellent',
    'AA (sf)-Very Strong',
    'A+ (sf)-strong',
    'A (sf)-Adequate',
  ];

  const creditSchema = yup.object().shape({
    // applicationNumber: yup.string().required('Application Reference No. Is Required'),
    ratingDate: yup
      .date()
      .required('Application Date is Required')
      .max(new Date(), 'Can Not be Select Future Date'),
    ratingObtained: yup.string().required('Settor Info is Required'),
    // applicationDate: yup
    //   .date()
    //   .required('Expected Rating Date is Required')
    //   .min(
    //     yup.ref('applicationDate'),
    //     'Expected Rating Date is Must be After Than Application Date '
    //   ),
    ratingLetterDoc: yup
      .mixed()
      .test('fileRequired', 'Rating Letter is required', (value) => hasUploadedFile(value)),
    creditRatingAgency: yup.string().required('Credit Rating Agency is required'),
  });

  const defaultValues = useMemo(
    () => ({
      // applicationNumber: currData?.applicationNumber || '',
      // applicationDate: normalizeDate(currData?.applicationDate),
      ratingObtained: currData?.ratingObtained || '',
      ratingDate: normalizeDate(currData?.ratingDate),
      ratingLetterDoc: currData?.ratingLetterDoc || '',
      creditRatingAgency: currData?.creditRatingAgency || '',
    }),
    [currData]
  );
  const methods = useForm({
    resolver: yupResolver(creditSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
    watch,
    control,
    setValue,
  } = methods;

  const values = watch();

  const requiredFields = [
    'creditRatingAgency',
    'ratingObtained',
    'ratingDate',
    'ratingLetterDoc',
  ];

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

    values.creditRatingAgency,
    values.ratingObtained,
    values.ratingDate,
    values.ratingLetterDoc,
  ]);

  // console.log(values);

  const onSubmit = handleSubmit(async (data) => {
    saveStepData(data);
    setActiveStepId('isin_application');
  });
  useEffect(() => {
    if (currData) {
      reset(defaultValues);
    }
  }, [defaultValues, currData, reset]);

  return (
    <Container>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box>
              <Typography variant="h4" color="primary" fontWeight={600}>
                Credit Rating
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Obtain a SEBI-registered credit rating for PTCs. Mandatory before NSDL/CDSL will
                process the ISIN application. Expected turnaround: 7–10 business days.{' '}
              </Typography>
            </Box>
          </Box>
          <Alert severity="warning" sx={{ mb: 2 }}>
                <b>SEBI Requirement:</b> Per SEBI  Regulations
                2008, all securitised instruments offered to more than 49 investors must carry a
                valid credit rating from a SEBI-registered CRA. ISIN application will be rejected
                without this.
          </Alert>
          <Controller
            name="creditRatingAgency"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { value, onChange } = field;

              return (
                <Card>
                  <Box display="flex" alignItems="center" sx={{ p: 3, pb: 0 }}>
                    <Typography fontWeight={600} color="primary">
                      Select Credit Rating Agency
                    </Typography>
                  </Box>

                  <Grid container p={2}>
                    {CardData.map((item, i) => {
                      const isSelected = value === item.heading;

                      return (
                        <Grid item xs={12} md={3} key={i}>
                          <Card
                            sx={(theme) => ({
                              m: 1,
                              borderRadius: 2,
                              boxShadow: theme.shadows[3],
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              textAlign: 'center',

                              width: '90%',
                              height: 90,
                        

                              cursor: 'pointer',
                              transition: '0.2s',

                              border: isSelected
                                ? `1px solid ${alpha(theme.palette.primary.light, 0.9)}`
                                : '1px solid transparent',

                              backgroundColor: isSelected
                                ? alpha(theme.palette.primary.lighter,0.9)
                                : 'transparent',

                              '&:hover': {
                                transform: 'scale(1.03)',
                                boxShadow: theme.shadows[8],
                              },
                            })}
                            onClick={() => onChange(item.heading)}
                          >
                            <Box textAlign="center" p={3}>
                              <Typography
                                fontWeight={600}
                                noWrap
                                sx={{ maxWidth: '100%' }}
                              >
                                {item.heading}
                              </Typography>
                              <Tooltip title={item.subHeading || ''} arrow>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {item.subHeading}
                              </Typography>
                              </Tooltip>
                            </Box>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {error && (
                    <Box pl={2} pb={2}>
                      <Typography color="error" variant="caption" sx={{ px: 2, pb: 3 }}>
                        {error.message}
                      </Typography>
                    </Box>
                  )}
                </Card>
              );
            }}
          />
          <Card>
            <Box display="flex" alignItems="center" sx={{ p: 3, pb: 0 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box>
                  <Typography fontWeight={600} color="primary">
                    Application Details
                  </Typography>
                  {/* <Typography variant="body2" color="text.secondary">
                                        Generate and execute the Trust Deed — the master legal framework. Escrow can only be opened after this is signed.
                                    </Typography> */}
                </Box>
              </Box>
            </Box>

            <Stack spacing={3} p={{ xs: 3 }}>
              {/* <Typography variant="subtitle2">Invoice Metadata</Typography> */}
              {/* <Box
                columnGap={2}
                rowGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  md: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField
                  name="applicationNumber"
                  label="Application Reference No."
                  type="text"
                  control={control}
                  disabled={disabled}
                />
                <RHFDatePicker
                  name="applicationDate"
                  label="Application Date"
                  maxDate={new Date()}
                  control={control}
                  disabled={disabled}
                />
              </Box> */}
              <Box
                columnGap={2}
                rowGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  md: 'repeat(2, 1fr)',
                }}
              >
                <Box>
                  <RHFSelect name="ratingObtained" label="Rating Obtained" control={control}>
                    {category.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                  <Typography variant="caption" color="text.secondary" mt={1}>
                    Expected rating: AA (sf) based on pool quality
                  </Typography>
                </Box>
                <RHFDatePicker
                  name="ratingDate"
                  label="Rating Date"
                  maxDate={new Date()}
                  control={control}
                  disabled={disabled}
                />
              </Box>
              <Box
                columnGap={2}
                rowGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  md: 'repeat(1, 1fr)',
                }}
              >
                <RHFCustomFileUploadBox
                  name="ratingLetterDoc"
                  label="Upload Rating Letter (PDF)"
                  disabled={disabled}
                  control={control}
                  accept={{ 'application/pdf': ['.pdf'] }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignContent: 'center', gap: 2 }}>
                <Button type="submit" variant="contained" color="primary" loading={isSubmitting}>
                  Next
                </Button>
              </Box>
            </Stack>
          </Card>

        </Stack>
      </FormProvider>
    </Container>
  );
}

CreditRating.propTypes = {
  currData: PropTypes.any,
  disabled: PropTypes.any,
  percent: PropTypes.func,
  saveStepData: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
};

export default CreditRating;
