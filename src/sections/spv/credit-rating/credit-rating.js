import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Card,
  Grid,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import useSWR from 'swr';
import RHFDatePicker from 'src/components/hook-form/rhf-date-picker';
import FormProvider, {
  RHFCustomFileUploadBox,
  RHFSelect,
} from 'src/components/hook-form';
import { useGetSpvApplicationStepData } from 'src/api/spvApplication';
import { useParams } from 'src/routes/hook';
import axiosInstance, { endpoints, fetcher } from 'src/utils/axios';

const normalizeDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const hasUploadedFile = (value) => {
  if (!value) return false;
  if (typeof value === 'string') return Boolean(value.trim());
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value?.id);
};

const getMediaId = (value) => (typeof value === 'string' ? value : value?.id || '');

const getAgencyInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

function CreditRating({ percent, saveStepData, setActiveStepId, isReadOnly }) {
  const params = useParams();
  const { id } = params;
  const { stepData } = useGetSpvApplicationStepData(id, 'credit_rating');
  const { data: agencies = [] } = useSWR(endpoints.creditRatingAgencies.list, fetcher);
  const { data: ratings = [] } = useSWR(endpoints.creditRatings.list, fetcher);

  const schema = yup.object().shape({
    creditRatingAgenciesId: yup.string().required('Credit rating agency is required'),
    creditRatingsId: yup.string().required('Credit rating is required'),
    ratingDate: yup.date().required('Rating date is required').max(new Date(), 'Future date is not allowed'),
    ratingLetterId: yup
      .mixed()
      .test('fileRequired', 'Rating letter is required', (value) => hasUploadedFile(value)),
  });

  const defaultValues = useMemo(
    () => ({
      creditRatingAgenciesId: stepData?.creditRatingAgenciesId || stepData?.creditRatingAgencies?.id || '',
      creditRatingsId: stepData?.creditRatingsId || stepData?.creditRatings?.id || '',
      ratingDate: normalizeDate(stepData?.ratingDate),
      ratingLetterId: stepData?.ratingLetter || stepData?.ratingLetterId || null,
    }),
    [stepData]
  );

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    const requiredFields = ['creditRatingAgenciesId', 'creditRatingsId', 'ratingDate', 'ratingLetterId'];
    const completed = requiredFields.filter((field) => Boolean(values[field])).length;
    percent?.((completed / requiredFields.length) * 100);
  }, [percent, values]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      creditRatingAgenciesId: data.creditRatingAgenciesId,
      creditRatingsId: data.creditRatingsId,
      ratingDate: new Date(data.ratingDate).toISOString().split('T')[0],
      ratingLetterId: getMediaId(data.ratingLetterId),
    };

    try {
      const res = await axiosInstance.patch(`/spv-pre/credit-rating/${id}`, payload);
      const nextData = res?.data?.details?.creditRating || {
        ...stepData,
        ...payload,
      };

      saveStepData?.(nextData);
      setActiveStepId('isin_application');
    } catch (error) {
      console.error('Failed to save credit rating', error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" color="primary" fontWeight={600}>
            Credit Rating
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This step now uses the backend agency list, rating list, and credit rating payload
            directly.
          </Typography>
        </Box>

        <Alert severity="warning">
          A rating agency, rating grade, rating date, and uploaded rating letter are all required.
        </Alert>

        <Controller
          name="creditRatingAgenciesId"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Card>
              <Box sx={{ p: 3, pb: 0 }}>
                <Typography fontWeight={600} color="primary">
                  Select Credit Rating Agency
                </Typography>
              </Box>

              <Grid container p={2}>
                {agencies.map((agency) => {
                  const isSelected = field.value === agency.id;

                  return (
                    <Grid item xs={12} md={3} key={agency.id}>
                      <Card
                        sx={(theme) => ({
                          m: 1,
                          p: 2,
                          cursor: isReadOnly ? 'default' : 'pointer',
                          border: '1px solid',
                          borderColor: isSelected
                            ? theme.palette.primary.main
                            : theme.palette.divider,
                          backgroundColor: isSelected
                            ? theme.palette.primary.lighter
                            : theme.palette.background.paper,
                        })}
                        onClick={() => {
                          if (isReadOnly) return;
                          field.onChange(agency.id);
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={(theme) => ({
                              width: 44,
                              height: 44,
                              borderRadius: 1,
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: theme.palette.background.neutral,
                              border: `1px solid ${theme.palette.divider}`,
                              overflow: 'hidden',
                              typography: 'subtitle2',
                              color: 'text.secondary',
                            })}
                          >
                            {agency.logo?.fileUrl ? (
                              <Box
                                component="img"
                                src={agency.logo.fileUrl}
                                alt={agency.name}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  p: 0.5,
                                }}
                              />
                            ) : (
                              getAgencyInitials(agency.name)
                            )}
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={600} noWrap>
                              {agency.name}
                            </Typography>
                            <Tooltip title={agency.description || ''} arrow>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  maxWidth: '100%',
                                  overflow: 'hidden',
                                  display: '-webkit-box',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: 3,
                                }}
                              >
                                {agency.description}
                              </Typography>
                            </Tooltip>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {error && (
                <Box px={3} pb={2}>
                  <Typography color="error" variant="caption">
                    {error.message}
                  </Typography>
                </Box>
              )}
            </Card>
          )}
        />

        <Card>
          <Stack spacing={3} p={3}>
            <Typography fontWeight={600} color="primary">
              Rating Details
            </Typography>

            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
            >
              <RHFSelect name="creditRatingsId" label="Rating Obtained" inputProps={{
                readOnly: isReadOnly,
              }}>
                {ratings.map((rating) => (
                  <MenuItem key={rating.id} value={rating.id}>
                    {rating.name}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFDatePicker
                disabled={isReadOnly}
                name="ratingDate"
                label="Rating Date"
                maxDate={new Date()}
                control={control}
              />
            </Box>

            <RHFCustomFileUploadBox
              name="ratingLetterId"
              label="Upload Rating Letter (PDF)"
              accept={{ 'application/pdf': ['.pdf'] }}
              disabled={isReadOnly}
            />

            {!isReadOnly && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  Next
                </Button>
              </Box>
            )}
          </Stack>
        </Card>
      </Stack>
    </FormProvider >
  );
}

CreditRating.propTypes = {
  percent: PropTypes.func,
  saveStepData: PropTypes.func,
  setActiveStepId: PropTypes.func.isRequired,
};

export default CreditRating;
