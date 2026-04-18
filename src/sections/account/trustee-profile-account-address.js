import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';

import {
  Box,
  Grid,
  Stack,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Card,
} from '@mui/material';

import FormProvider, {
  RHFTextField,
  RHFSelect,
  RHFCustomFileUploadBox,
} from 'src/components/hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';

import { useGetAddressDetails } from 'src/api/address-details';
import axiosInstance from 'src/utils/axios';

export default function AddressNewForm({ onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const [isUploading, setIsUploading] = useState(false);

  const { registeredAddress, correspondenceAddress, addressDetailsLoading } = useGetAddressDetails();

  const [registeredAddressData, setRegisteredAddressData] = useState(null);
  const [correspondenceAddressData, setCorrespondenceAddressData] = useState(null);

  const AddressSchema = Yup.object().shape({
    documentType: Yup.string().required('Please select document type'),
    registeredAddressLine1: Yup.string().required('Required'),
    registeredAddressLine2: Yup.string(),
    registeredCountry: Yup.string().required('Required'),
    registeredCity: Yup.string().required('Required'),
    registeredState: Yup.string().required('Required'),
    registeredPincode: Yup.string().required('Required').matches(/^[0-9]+$/, 'Invalid'),
    sameAsRegistered: Yup.boolean(),
    correspondenceAddressLine1: Yup.string().when('sameAsRegistered', {
      is: false,
      then: (schema) => schema.required('Required'),
    }),
    correspondenceAddressLine2: Yup.string(),
    correspondenceCountry: Yup.string().required('Required'),
    correspondenceCity: Yup.string().when('sameAsRegistered', {
      is: false,
      then: (schema) => schema.required('Required'),
    }),
    correspondenceState: Yup.string().when('sameAsRegistered', {
      is: false,
      then: (schema) => schema.required('Required'),
    }),
    correspondencePincode: Yup.string().when('sameAsRegistered', {
      is: false,
      then: (schema) => schema.required('Required').matches(/^[0-9]{6}$/, 'Invalid'),
    }),
    addressProof: Yup.mixed().required('Required'),
  });

  const defaultValues = useMemo(
    () => ({
      documentType: registeredAddressData?.documentType || 'electricity_bill',
      registeredAddressLine1: registeredAddressData?.addressLineOne || '',
      registeredAddressLine2: registeredAddressData?.addressLineTwo || '',
      registeredCountry: registeredAddressData?.country || 'India',
      registeredCity: registeredAddressData?.city || '',
      registeredState: registeredAddressData?.state || '',
      registeredPincode: registeredAddressData?.pincode || '',
      sameAsRegistered:
        !!registeredAddressData &&
        !!correspondenceAddressData &&
        registeredAddressData.addressLineOne === correspondenceAddressData.addressLineOne &&
        registeredAddressData.city === correspondenceAddressData.city &&
        registeredAddressData.state === correspondenceAddressData.state &&
        registeredAddressData.pincode === correspondenceAddressData.pincode,
      correspondenceAddressLine1: correspondenceAddressData?.addressLineOne || '',
      correspondenceAddressLine2: correspondenceAddressData?.addressLineTwo || '',
      correspondenceCountry: correspondenceAddressData?.country || 'India',
      correspondenceCity: correspondenceAddressData?.city || '',
      correspondenceState: correspondenceAddressData?.state || '',
      correspondencePincode: correspondenceAddressData?.pincode || '',
      addressProof: registeredAddressData?.addressProof || null,
    }),
    [registeredAddressData, correspondenceAddressData]
  );

  const methods = useForm({
    defaultValues,
    resolver: yupResolver(AddressSchema),
  });

  const { reset, handleSubmit, setValue, watch, control } = methods;

  const sameAsRegistered = watch('sameAsRegistered');
  const documentType = useWatch({ control, name: 'documentType' });

  useEffect(() => {
    if (sameAsRegistered) {
      setValue('correspondenceAddressLine1', watch('registeredAddressLine1'));
      setValue('correspondenceAddressLine2', watch('registeredAddressLine2'));
      setValue('correspondenceCountry', watch('registeredCountry'));
      setValue('correspondenceCity', watch('registeredCity'));
      setValue('correspondenceState', watch('registeredState'));
      setValue('correspondencePincode', watch('registeredPincode'));
    }
  }, [sameAsRegistered, setValue, watch]);

  useEffect(() => {
    if ((registeredAddress || correspondenceAddress) && !addressDetailsLoading) {
      if (registeredAddress) {
        setRegisteredAddressData(registeredAddress);
      }

      if (correspondenceAddress) {
        setCorrespondenceAddressData(correspondenceAddress);
      }
    }
  }, [registeredAddress, correspondenceAddress, addressDetailsLoading]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (form) => {
    try {
      setIsUploading(true);

      const registeredAddressPayload = {
        addressType: 'registered',
        addressLineOne: form.registeredAddressLine1,
        addressLineTwo: form.registeredAddressLine2 || null,
        country: form.registeredCountry,
        city: form.registeredCity,
        state: form.registeredState,
        pincode: form.registeredPincode,
        documentType: form.documentType,
        addressProofId: form.addressProof?.id,
      };

      const correspondenceAddressPayload = {
        addressType: 'correspondence',
        addressLineOne: form.sameAsRegistered
          ? form.registeredAddressLine1
          : form.correspondenceAddressLine1,
        addressLineTwo: form.sameAsRegistered
          ? form.registeredAddressLine2 || null
          : form.correspondenceAddressLine2 || null,
        country: form.sameAsRegistered ? form.registeredCountry : form.correspondenceCountry,
        city: form.sameAsRegistered ? form.registeredCity : form.correspondenceCity,
        state: form.sameAsRegistered ? form.registeredState : form.correspondenceState,
        pincode: form.sameAsRegistered ? form.registeredPincode : form.correspondencePincode,
        documentType: form.documentType,
        addressProofId: form.addressProof?.id,
      };

      await axiosInstance.post('/trustee-profiles/address-details', {
        registeredAddress: registeredAddressPayload,
        correspondenceAddress: correspondenceAddressPayload,
      });

      enqueueSnackbar('Address details saved successfully', { variant: 'success' });
      onClose?.();
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.error?.message || 'Failed to save address', {
        variant: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack component={Card} spacing={3} sx={{ p: 3 }}>
        <Stack spacing={4}>
          <Stack spacing={2}>
            <Typography variant="h4" color="primary">Upload Address Proof</Typography>

            <Box sx={{ width: 200 }}>
              <RHFSelect name="documentType" label="Document Type">
                <MenuItem value="electricity_bill">Electricity Bill</MenuItem>
                <MenuItem value="lease_agreement">Lease Agreement</MenuItem>
              </RHFSelect>
            </Box>

            <RHFCustomFileUploadBox
              name="addressProof"
              label={`Upload ${
                (documentType === 'electricity_bill' && 'Electricity Bill') ||
                (documentType === 'lease_agreement' && 'Lease Agreement')
              }`}
              icon="mdi:file-document-outline"
            />
          </Stack>

          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2,
                  minHeight: 40,
                }}
              >
                <Typography variant="h5">Registered Address</Typography>
                <Box sx={{ width: { xs: 0, md: 190 }, flexShrink: 0 }} />
              </Box>

              <Stack spacing={2}>
                <RHFTextField name="registeredAddressLine1" label="Address Line 1" />
                <RHFTextField name="registeredAddressLine2" label="Address Line 2" />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="registeredCountry" label="Country" disabled />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="registeredCity" label="City" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="registeredState" label="State" />
                  </Grid>
                </Grid>

                <RHFTextField name="registeredPincode" label="Pincode" />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2,
                  minHeight: 40,
                }}
              >
                <Typography variant="h5">Correspondence Address</Typography>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sameAsRegistered}
                      onChange={(e) => setValue('sameAsRegistered', e.target.checked)}
                    />
                  }
                  label="Same as Registered"
                />
              </Box>

              <Stack spacing={2} sx={{ opacity: sameAsRegistered ? 0.5 : 1 }}>
                <RHFTextField
                  name="correspondenceAddressLine1"
                  label="Address Line 1"
                  disabled={sameAsRegistered}
                />
                <RHFTextField
                  name="correspondenceAddressLine2"
                  label="Address Line 2"
                  disabled={sameAsRegistered}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField name="correspondenceCountry" label="Country" disabled />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="correspondenceCity"
                      label="City"
                      disabled={sameAsRegistered}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <RHFTextField
                      name="correspondenceState"
                      label="State"
                      disabled={sameAsRegistered}
                    />
                  </Grid>
                </Grid>

                <RHFTextField
                  name="correspondencePincode"
                  label="Pincode"
                  disabled={sameAsRegistered}
                />
              </Stack>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
         
            <LoadingButton type="submit" variant="contained" color="primary" loading={isUploading} sx={{ ml: 'auto' }}>
              Save Changes
            </LoadingButton>
          </Box>
        </Stack>
      </Stack>
    </FormProvider>
  );
}

AddressNewForm.propTypes = {
  onClose: PropTypes.func,
};
