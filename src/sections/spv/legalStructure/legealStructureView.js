import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Card, Chip, MenuItem, Typography } from '@mui/material';
import { alpha, Box, Container, Stack } from '@mui/system';
import { useForm, useWatch } from 'react-hook-form';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useContext, useEffect, useMemo } from 'react';

import DocumentCard from 'src/components/card/documentCard';
import { AuthContext } from 'src/auth/context/jwt';

function LegelStructureView({ percent, setActiveStepId, currData, saveStepData }) {

  const { user } = useContext(AuthContext);

  const Law = [
    { value: 'Indian Trusts Act, 1882 + SARFAESI Act, 2002', label: 'Indian Trusts Act, 1882 + SARFAESI Act, 2002' },
    { value: 'Indian Trusts Act, 1882 only', label: 'Indian Trusts Act, 1882 only' },
  ];

  const Clause = [
    { value: 'full', label: 'Full Isolation (Recommended)' },
    { value: 'partial', label: 'Partial Isolation' },
  ];

  const documents = [
    {
      id: 1,
      title: 'Trust Deed — Generated',
      description: 'PDF auto-generated with all SPV parameters · 14 pages',
      type: 'primary',
      icon: 'qlementine-icons:success-16',
      docLink: '/assets/spv-Document/trust_deed_realistic_demo.pdf',
      button: 'View Draft',
    },
    {
      id: 5,
      title: 'Trustee E-Sign — Pending',
      description: 'Priya Mehta (Lead Trustee) · Sent via DigiLocker/eSign India',
      type: 'warning',
      icon: 'solar:arrow-right-outline',
      button: 'Sign Now →',
    },
    {
      id: 6,
      title: 'Settlor E-Sign — Waiting',
      description: 'FinFlow Capital authorized signatory · Unlocks after Trustee signs',
      type: 'error',
      icon: 'mynaui:three-solid',
    },
    {
      id: 7,
      title: 'Stamp Duty & Registration — Locked',
      description: 'Maharashtra Stamp Act applicable · ₹500 stamp duty',
      type: 'error',
      icon: 'mynaui:four-solid',
    },
  ];

  const mergeDocuments = (baseDocs) => {
    return baseDocs.map((doc) => {
      const found = currData?.documents?.find((d) => d.id === doc.id);
      return {
        ...doc,
        status: found?.status || 'PENDING',
      };
    });
  };

  const defaultValues = useMemo(
    () => ({
      trustName: currData?.trustName || 'Axis Trustee Services Ltd',
      trusteeEntity: currData?.trusteeEntity || 'Axis Trustee Services Ltd',
      settlor: currData?.settlor || 'BirbalPlus',
      governingLaw: currData?.governingLaw || '',
      bankruptcy: currData?.bankruptcy || '',
      trustDuration: currData?.trustDuration || '',
      documents: mergeDocuments(documents),
    }),
    [currData]
  );

  const trustSchema = yup.object().shape({
    trustName: yup.string().required('Trust Name Is Required'),
    trusteeEntity: yup.string().required('Trust Entity is Required'),
    settlor: yup.string().required('Settor Info is Required'),
    governingLaw: yup.string().required('Law is Required'),
    bankruptcy: yup.string().required('Bankruptcy Remoteness Clause is Required'),
    trustDuration: yup.string().required('Duration Is Required'),

    documents: yup.array().of(
      yup.object().shape({
        status: yup.string().test(
          'doc-validation',
          'Complete all required documents',
          function (value) {
            return value === 'COMPLETED';
          }
        ),
      })
    ),
  });

  const methods = useForm({
    resolver: yupResolver(trustSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (currData) {
      reset({
        trustName: currData?.trustName,
        trusteeEntity: currData?.trusteeEntity,
        settlor: currData?.settlor,
        governingLaw: currData?.governingLaw,
        bankruptcy: currData?.bankruptcy,
        trustDuration: currData?.trustDuration,
        documents: mergeDocuments(documents),
      });
    }
  }, [currData, reset]);

  const requiredFields = [
    'trustName',
    'trusteeEntity',
    'settlor',
    'governingLaw',
    'bankruptcy',
    'trustDuration',
  ];

  const watchedFields = useWatch({
    control,
    name: requiredFields,
  });

  const formDocuments = useWatch({
    control,
    name: 'documents',
  }) || [];

  useEffect(() => {
    const completedFields = watchedFields.filter(Boolean).length;

    const requiredDocuments = formDocuments;

    const completedDocuments = requiredDocuments.filter(
      (doc) => doc.status === 'COMPLETED' || doc.status === 'SIGNED'
    ).length;

    const completed = completedFields + completedDocuments;
    const totalRequiredItems = requiredFields.length + requiredDocuments.length;
    const percentValue =
      totalRequiredItems > 0 ? Math.round((completed / totalRequiredItems) * 100) : 0;

    percent?.(percentValue);
  }, [watchedFields, formDocuments]);

  const onSubmit = handleSubmit(async (data) => {
    console.log('Form Data', data);
    saveStepData(data);
    setActiveStepId('escrow_setup');
  });

  return (
    <Container>
      <FormProvider methods={methods} onSubmit={onSubmit}>
           <Alert severity="info" sx={{ mb: 2 }}>
          Why Legal first? The Trust Deed establishes the legal SPV entity under the Trustee's
          fiduciary control. Axis Bank will only open the escrow account after receiving a signed
          copy of the Trust Deed. This step must be completed before Step 5.
        </Alert>
        <Card>
          <Box display="flex" alignItems="center" sx={{ px: 3, py: 1 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box>
                <Typography variant="h5" color="primary" py={1}>
                  Legal Structure & Trust Deed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate and execute the Trust Deed — the master legal framework. Escrow can only
                  be opened after this is signed.
                </Typography>
              </Box>
            </Box>
          </Box>
          <Stack spacing={3} p={{ xs: 3 }}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="trustName" label="Trust Name (Legal)" type="text" disabled/>
              <RHFTextField name="trusteeEntity" label="Trustee Entity" type="text" disabled />
            </Box>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="settlor" label="Settlor (Platform NBFC)" type="text" disabled/>
              <RHFSelect name="governingLaw" label="Governing Law*">
                {Law.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>
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
                <RHFSelect name="bankruptcy" label="Bankruptcy Remoteness Clause*">
                  {Clause.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <Typography variant="body2" mt={1} color="text.secondary">
                  Full isolation protects investors if platform defaults
                </Typography>
              </Box>
              <RHFTextField name="trustDuration" label="Trust Duration" type="text" />
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 3, mt: 3 }}>
          <Typography variant="subtitle1" color="primary" mb={2}>
            Execution Status
          </Typography>

          <Stack spacing={2}>
            {formDocuments.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                description={doc.description}
                icon={doc.icon}
                status={doc.status}
                docLink={doc.docLink}
                button={doc.button}
                onSign={() => {
                  setValue(`documents.${index}.status`, 'COMPLETED', {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                }}
              />
            ))}
          </Stack>

          {errors.documents && (
            <Typography color="error">
              Please complete all required documents
            </Typography>
          )}
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3 }}>
          <Button type="submit" variant="contained" color="primary">
            Next
          </Button>
        </Box>
      </FormProvider>
    </Container>
  );
}

LegelStructureView.propTypes = {
  percent: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
};

export default LegelStructureView;
