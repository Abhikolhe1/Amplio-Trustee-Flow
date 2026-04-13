import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Card, MenuItem, Typography } from '@mui/material';
import { Box, Container, Stack } from '@mui/system';
import { useForm, useWatch } from 'react-hook-form';
import FormProvider, { RHFCustomFileUploadBox, RHFSelect, RHFTextField } from 'src/components/hook-form';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useEffect, useMemo, useRef, useState } from 'react';

import DocumentCard from 'src/components/card/documentCard';

const EMPTY_ARRAY = [];

const REQUIRED_FIELDS = [
  'trustName',
  'trusteeEntity',
  'settlor',
  'governingLaw',
  'bankruptcy',
  'trustDuration',
];

const DOCUMENTS = [
  {
    id: 1,
    title: 'Trust Deed',
    description: 'PDF auto-generated with all SPV parameters · 14 pages',
    type: 'primary',
    icon: 'qlementine-icons:success-16',
    docLink: '/assets/spv-Document/trust_deed_realistic_demo.pdf',
    button: 'E-Sign',
  },
  {
    id: 6,
    title: 'Settlor E-Sign — Waiting',
    description: 'FinFlow Capital authorized signatory · Unlocks after Trustee signs',
    type: 'error',
    icon: 'mynaui:three-solid',
    button: 'E-Sign',
  },
];

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

const getFileStorageKey = (value) => {
  if (!value) {
    return '';
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => item?.id || item?.url || item?.name || JSON.stringify(item))
      .join('|');
  }

  if (typeof value === 'string') {
    return value;
  }

  return value?.id || value?.url || value?.name || JSON.stringify(value);
};

const mergeDocuments = (baseDocs, currentDocuments = []) =>
  baseDocs.map((doc) => {
    const found = currentDocuments.find((item) => item.id === doc.id);

    return {
      ...doc,
      status: found?.status || 'PENDING',
    };
  });

function LegelStructureView({ percent, setActiveStepId, currData, saveStepData }) {
  const previousDocumentsKeyRef = useRef('');


  const previousStampFileKeyRef = useRef('');

  const [isFirstCardSaved, setIsFirstCardSaved] = useState(
    currData?.isFirstCardSaved || false
  );
  const [isSecondCardSaved, setIsSecondCardSaved] = useState(
    currData?.isSecondCardSaved || false
  );

  const Law = [
    {
      value: 'Indian Trusts Act, 1882 + SARFAESI Act, 2002',
      label: 'Indian Trusts Act, 1882 + SARFAESI Act, 2002',
    },
    { value: 'Indian Trusts Act, 1882 only', label: 'Indian Trusts Act, 1882 only' },
  ];

  const Clause = [
    { value: 'full', label: 'Full Isolation (Recommended)' },
    { value: 'partial', label: 'Partial Isolation' },
  ];

  const defaultValues = useMemo(
    () => ({
      trustName: currData?.trustName || 'Axis Trustee Services Ltd',
      trusteeEntity: currData?.trusteeEntity || 'Axis Trustee Services Ltd',
      settlor: currData?.settlor || 'BirbalPlus',
      governingLaw:
        currData?.governingLaw || 'Indian Trusts Act, 1882 + SARFAESI Act, 2002',
      bankruptcy: currData?.bankruptcy || 'full',
      trustDuration: currData?.trustDuration || '',
      stampFile: currData?.stampFile || null,
      documents: mergeDocuments(DOCUMENTS, currData?.documents),
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
    stampFile: yup
      .mixed()
      .test('fileRequired', 'Stamp duty document is required', (value) => hasUploadedFile(value)),
    documents: yup.array().of(
      yup.object().shape({
        status: yup.string().test(
          'doc-validation',
          'Complete all required documents',
          function (value) {
            return value === 'COMPLETED' || value === 'SIGNED';
          }
        ),
      })
    ),
  });

  const methods = useForm({
    resolver: yupResolver(trustSchema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    control,
    reset,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = methods;



  useEffect(() => {
    if (currData) {
      reset({
        trustName: currData?.trustName || 'Axis Trustee Services Ltd',
        trusteeEntity: currData?.trusteeEntity || 'Axis Trustee Services Ltd',
        settlor: currData?.settlor || 'BirbalPlus',
        governingLaw:
          currData?.governingLaw || 'Indian Trusts Act, 1882 + SARFAESI Act, 2002',
        bankruptcy: currData?.bankruptcy || 'full',
        trustDuration: currData?.trustDuration || '',
        stampFile: currData?.stampFile || null,
        documents: mergeDocuments(DOCUMENTS, currData?.documents),
      });

      setIsFirstCardSaved(currData?.isFirstCardSaved || false);
      setIsSecondCardSaved(currData?.isSecondCardSaved || false);
    }
  }, [currData, reset]);

  const watchedFields = useWatch({
    control,
    name: REQUIRED_FIELDS,
  });

  const watchedDocuments = useWatch({
    control,
    name: 'documents',
  });

  const formDocuments = watchedDocuments || EMPTY_ARRAY;

  const stampFile = useWatch({
    control,
    name: 'stampFile',
  });

  useEffect(() => {
    const firstCardFilledCount = watchedFields.filter(
      (value) => value !== undefined && value !== null && value !== ''
    ).length;

    const firstCardPercent = Math.round(
      (firstCardFilledCount / REQUIRED_FIELDS.length) * 50
    );

    const completedDocuments = formDocuments.filter(
      (doc) => doc.status === 'COMPLETED' || doc.status === 'SIGNED'
    ).length;

    const executionItemsCount = formDocuments.length + 1;
    const completedExecutionItems =
      completedDocuments + (hasUploadedFile(stampFile) ? 1 : 0);

    const secondCardPercent =
      executionItemsCount > 0
        ? Math.round((completedExecutionItems / executionItemsCount) * 50)
        : 0;

    const totalPercent = firstCardPercent + secondCardPercent;

    percent?.(totalPercent);
  }, [watchedFields, formDocuments, stampFile, percent]);

  useEffect(() => {
    const documentsKey = JSON.stringify(
      (formDocuments || []).map((doc) => ({ id: doc.id, status: doc.status }))
    );
    const stampFileKey = getFileStorageKey(stampFile);

    const hasDocumentsChanged = previousDocumentsKeyRef.current !== documentsKey;
    const hasStampFileChanged = previousStampFileKeyRef.current !== stampFileKey;

    previousDocumentsKeyRef.current = documentsKey;
    previousStampFileKeyRef.current = stampFileKey;

    if (!hasDocumentsChanged && !hasStampFileChanged) {
      return;
    }

    saveStepData?.({
      ...getValues(),
      documents: formDocuments,
      stampFile,
      isFirstCardSaved,
      isSecondCardSaved,
    });
  }, [formDocuments, getValues, isFirstCardSaved, isSecondCardSaved, saveStepData, stampFile]);

  const handleFirstCardSave = async () => {

    const isValid = await trigger([
      'trustName',
      'trusteeEntity',
      'settlor',
      'governingLaw',
      'bankruptcy',
      'trustDuration',
    ]);

    if (!isValid) return;

    const data = getValues();

    saveStepData({
      ...data,
      isFirstCardSaved: true,
      isSecondCardSaved,
    });

    setIsFirstCardSaved(true);
  };

  const handleSecondCardSave = async () => {
    const isValid = await trigger(['documents', 'stampFile']);
    const documentsData = getValues('documents') || [];
    const stampFileData = getValues('stampFile');

    const allCompleted = documentsData.every(
      (doc) => doc.status === 'COMPLETED' || doc.status === 'SIGNED'
    );

    if (!isValid || !allCompleted || !hasUploadedFile(stampFileData)) {
      return;
    }

    const data = getValues();

    saveStepData({
      ...data,
      isFirstCardSaved,
      isSecondCardSaved: true,
    });

    setIsSecondCardSaved(true);
  };

  const handleNext = () => {
    if (!isFirstCardSaved || !isSecondCardSaved) return;

    const data = getValues();

    saveStepData({
      ...data,
      isFirstCardSaved,
      isSecondCardSaved,
    });

    setActiveStepId('escrow_setup');
  };

  return (
    <Container>
      <FormProvider methods={methods}>
        <Card>
          <Box display="flex" alignItems="center" sx={{ px: 3, py: 1 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box>
                <Typography variant="h5" color="primary" py={1}>
                  Legal Structure & Trust Deed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate and execute the Trust Deed — the master legal framework.
                  Escrow can only be opened after this is signed.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Alert severity="info" sx={{ m: 3 }}>
            Why Legal first? The Trust Deed establishes the legal SPV entity under the
            Trustee&apos;s fiduciary control. Axis Bank will only open the escrow account
            after receiving a signed copy of the Trust Deed. This step must be completed
            before Step 5.
          </Alert>

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
              <RHFTextField name="trustName" label="Trust Name (Legal)" type="text" disabled />
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
              <RHFTextField
                name="settlor"
                label="Settlor (Platform NBFC)"
                type="text"
                disabled
              />

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
                <RHFSelect
                  name="bankruptcy"
                  label="Bankruptcy Remoteness Clause*"
                >
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

              <RHFTextField
                name="trustDuration"
                label="Trust Duration"
                type="text"
                placeholder="5 Years (extendable)"
              />
            </Box>
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mr: 3 }}>
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={handleFirstCardSave}
            >
              Save
            </Button>
          </Box>
        </Card>
 {isFirstCardSaved && 
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
            <Box>
            <Typography  variant='subtitle1'>Stamp Duty & Registration — Locked</Typography>
            <Typography pb={2} variant='body2'>Maharashtra Stamp Act applicable · ₹500 stamp duty</Typography>
            <RHFCustomFileUploadBox
              name="stampFile"
              label="Document Upload*"
              icon="mdi:file-document-outline"
             accept={{ 'application/pdf': ['.pdf'] }}
            />
            {errors.stampFile && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                {errors.stampFile.message}
              </Typography>
            )}
            </Box>
          </Stack>

          {errors.documents && (
            <Typography color="error">Please complete all required documents</Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={handleSecondCardSave}
              disabled={!isFirstCardSaved}
            >
              Save
            </Button>
          </Box>
        </Card>
}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={!isFirstCardSaved || !isSecondCardSaved}
          >
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
  currData: PropTypes.object,
  saveStepData: PropTypes.func,
};

export default LegelStructureView;
