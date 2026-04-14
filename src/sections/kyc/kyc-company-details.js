import * as Yup from 'yup';
import { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Card } from '@mui/material';

import FormProvider, { RHFCustomFileUploadBox } from 'src/components/hook-form';
import { RHFSelect } from 'src/components/hook-form/rhf-select';

import { useForm, useWatch } from 'react-hook-form';

import { enqueueSnackbar } from 'notistack';
import { useGetKycSection } from 'src/api/trusteeKyc';
import { yupResolver } from '@hookform/resolvers/yup';
import axiosInstance from 'src/utils/axios';
import KYCFooter from './kyc-footer';

const FILE_ACCEPT = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};

const SPECIAL_DOC_VALUES = ['certificate_of_incorporation', 'gst_certificate'];

function getDocStatusMeta(item) {
  const serverDocument = item?.documentFile;
  const serverStatus = Number(serverDocument?.status);
  const rejectionReason = serverStatus === 2 ? serverDocument?.reason : '';

  return {
    rejectionReason,
  };
}

function normalizeFile(file) {
  if (!file?.id) return null;

  return {
    ...file,
    id: file.id,
    fileUrl: file.fileUrl,
    fileOriginalName: file.fileOriginalName,
  };
}

export default function KYCCompanyDetails({
  percent,
  setActiveStepId,
  dataInitializedSteps,
  setDataInitializedSteps,
}) {
  const { kycSectionData, kycSectionLoading, kycSectionError, refreshKycSection } =
    useGetKycSection('trustee_documents', '/trustee-kyc/company-details');

  const documents = useMemo(
    () => (Array.isArray(kycSectionData?.data) ? kycSectionData.data : []),
    [kycSectionData]
  );

  const documentsByValue = useMemo(() => {
    const map = {};

    documents.forEach((item) => {
      if (item?.documentValue) {
        map[item.documentValue] = item;
      }
    });

    return map;
  }, [documents]);

  const certificateDoc = documentsByValue.certificate_of_incorporation || null;
  const gstDoc = documentsByValue.gst_certificate || null;
  const moaDoc = documentsByValue.moa || null;
  const aoaDoc = documentsByValue.aoa || null;

  const defaultMoaAoaType = useMemo(() => {
    if (moaDoc?.documentFile?.documentFile?.id) return 'moa';
    if (aoaDoc?.documentFile?.documentFile?.id) return 'aoa';
    if (moaDoc) return 'moa';
    if (aoaDoc) return 'aoa';
    return '';
  }, [moaDoc, aoaDoc]);

  const defaultValues = useMemo(() => {
    const values = {};

    documents.forEach((item) => {
      values[`doc_${item.documentId}`] = normalizeFile(item?.documentFile?.documentFile);
    });

    values.moaAoaType = defaultMoaAoaType;
    return values;
  }, [documents, defaultMoaAoaType]);

  const validationSchema = useMemo(() => {
    const shape = {};

    if (moaDoc || aoaDoc) {
      shape.moaAoaType = Yup.string().required('Please select a document type (MoA or AoA)');
    }

    if (certificateDoc?.documentId) {
      shape[`doc_${certificateDoc.documentId}`] = Yup.object()
        .nullable()
        .required(`${certificateDoc.documentLabel || 'Certificate of Incorporation'} is required`)
        .test(
          'has-id',
          `${certificateDoc.documentLabel || 'Certificate of Incorporation'} is required`,
          (val) => Boolean(val?.id)
        );
    }

    if (gstDoc?.documentId) {
      shape[`doc_${gstDoc.documentId}`] = Yup.object()
        .nullable()
        .required(`${gstDoc.documentLabel || 'GST Certificate'} is required`)
        .test('has-id', `${gstDoc.documentLabel || 'GST Certificate'} is required`, (val) =>
          Boolean(val?.id)
        );
    }

    documents.forEach((item) => {
      if (!item?.documentId) return;
      if (SPECIAL_DOC_VALUES.includes(item.documentValue)) return;

      if (item.documentValue === 'moa' || item.documentValue === 'aoa') {
        shape[`doc_${item.documentId}`] = Yup.object()
          .nullable()
          .test('selected-doc-required', `${item.documentLabel} is required`, function (val) {
            const selectedType = this.parent?.moaAoaType;
            if (selectedType !== item.documentValue) {
              return true;
            }

            return Boolean(val?.id);
          });

        return;
      }

      if (item.isMandatory) {
        shape[`doc_${item.documentId}`] = Yup.object()
          .nullable()
          .required(`${item.documentLabel} is required`)
          .test('has-id', `${item.documentLabel} is required`, (val) => Boolean(val?.id));
      } else {
        shape[`doc_${item.documentId}`] = Yup.object().nullable().optional();
      }
    });

    return Yup.object().shape(shape);
  }, [documents, certificateDoc, gstDoc, moaDoc, aoaDoc]);

  const methods = useForm({
    defaultValues: {},
    resolver: yupResolver(validationSchema),
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = useWatch({ control });
  const moaAoaType = useWatch({ control, name: 'moaAoaType' });
  const prevPercentRef = useRef(null);

  const selectedMoaAoaDoc = useMemo(() => {
    if (moaAoaType === 'aoa' && aoaDoc) return aoaDoc;
    if (moaAoaType === 'moa' && moaDoc) return moaDoc;
    if (moaDoc) return moaDoc;
    if (aoaDoc) return aoaDoc;
    return null;
  }, [moaAoaType, moaDoc, aoaDoc]);

  const mandatoryDocumentIds = useMemo(() => {
    const mandatoryIds = new Set();

    if (certificateDoc?.documentId) mandatoryIds.add(certificateDoc.documentId);
    if (gstDoc?.documentId) mandatoryIds.add(gstDoc.documentId);
    if (selectedMoaAoaDoc?.documentId) mandatoryIds.add(selectedMoaAoaDoc.documentId);

    documents.forEach((item) => {
      if (
        item?.isMandatory &&
        !SPECIAL_DOC_VALUES.includes(item.documentValue) &&
        item.documentValue !== 'moa' &&
        item.documentValue !== 'aoa'
      ) {
        mandatoryIds.add(item.documentId);
      }
    });

    return Array.from(mandatoryIds);
  }, [documents, certificateDoc, gstDoc, selectedMoaAoaDoc]);

  const remainingDocuments = useMemo(() => {
    const excludedIds = new Set(
      [certificateDoc?.documentId, gstDoc?.documentId, moaDoc?.documentId, aoaDoc?.documentId].filter(
        Boolean
      )
    );

    return documents.filter((item) => !excludedIds.has(item.documentId));
  }, [documents, certificateDoc, gstDoc, moaDoc, aoaDoc]);

  const hasServerData = useMemo(
    () => documents.some((item) => item?.documentFile?.documentFile?.id),
    [documents]
  );

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!mandatoryDocumentIds.length) {
      if (prevPercentRef.current !== 0) {
        prevPercentRef.current = 0;
        percent(0);
      }
      return;
    }

    const uploadedMandatoryCount = mandatoryDocumentIds.filter((id) =>
      Boolean(values?.[`doc_${id}`]?.id)
    ).length;

    const calculatedPercent = Math.round(
      (uploadedMandatoryCount / mandatoryDocumentIds.length) * 100
    );

    if (prevPercentRef.current !== calculatedPercent) {
      prevPercentRef.current = calculatedPercent;
      percent(calculatedPercent);
    }
  }, [mandatoryDocumentIds, values, percent]);

  useEffect(() => {
    if (!mandatoryDocumentIds.length) return;
    if (!hasServerData) return;

    const isStepComplete = mandatoryDocumentIds.every((id) => Boolean(values?.[`doc_${id}`]?.id));

    if (isStepComplete && !dataInitializedSteps?.includes('kyc_company_documents')) {
      setDataInitializedSteps();
      setActiveStepId();
    }
  }, [
    mandatoryDocumentIds,
    values,
    hasServerData,
    dataInitializedSteps,
    setDataInitializedSteps,
    setActiveStepId,
  ]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const usersId =
        sessionStorage.getItem('trustee_user_id') || sessionStorage.getItem('trustee_profile_id');

      if (!usersId) {
        enqueueSnackbar('User ID missing', { variant: 'error' });
        return;
      }

      const uploadedDocuments = documents
        .map((item) => {
          if (
            (item.documentValue === 'moa' || item.documentValue === 'aoa') &&
            selectedMoaAoaDoc &&
            item.documentId !== selectedMoaAoaDoc.documentId
          ) {
            return null;
          }

          const uploadedFile = formData?.[`doc_${item.documentId}`];
          if (!uploadedFile?.id) return null;

          return {
            trusteeKycDocumentRequirementsId: item.documentId,
            documentsFileId: uploadedFile.id,
            mode: 1,
            status: 0,
          };
        })
        .filter(Boolean);

      if (!uploadedDocuments.length) {
        enqueueSnackbar('Please upload at least one document', { variant: 'error' });
        return;
      }

      const payload = {
        usersId,
        documents: uploadedDocuments,
      };

      const hasExistingDocs = documents.some((doc) => doc?.documentFile?.documentFile?.id);

      const response = hasExistingDocs
        ? await axiosInstance.patch('/trustee-profiles/kyc-upload-documents', payload)
        : await axiosInstance.post('/trustee-profiles/kyc-upload-documents', payload);

      if (!response?.data?.success) {
        enqueueSnackbar(response?.data?.message || 'Unable to upload documents', {
          variant: 'error',
        });
        return;
      }

      await refreshKycSection();
      enqueueSnackbar('Documents uploaded successfully', { variant: 'success' });
      setActiveStepId();
    } catch (error) {
      const message = error?.error?.message || error?.message || 'Error uploading documents';

      enqueueSnackbar(message, { variant: 'error' });
    }
  });

  const renderDocumentField = (item, mandatory = false) => {
    if (!item?.documentId) return null;

    const fieldName = `doc_${item.documentId}`;
    const { rejectionReason } = getDocStatusMeta(item);

    return (
      <Box key={item.documentId}>
        <RHFCustomFileUploadBox
          name={fieldName}
          label={`${item.documentLabel}${mandatory ? ' *' : ''}`}
          icon="mdi:file-document-outline"
          accept={FILE_ACCEPT}
        />

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
          {rejectionReason && (
            <Typography variant="caption" color="error.main">
              Reason: {rejectionReason}
            </Typography>
          )}
        </Stack>
      </Box>
    );
  };

  return (
    <Container>
      <Card
        sx={{
          p: 4,
          borderRadius: 3,
          width: '100%',
          boxShadow: '0px 8px 25px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 600,
        }}
      >
        <Stack spacing={0.5} alignItems="flex-start" sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            color="primary"
            sx={{
              fontWeight: 700,
              textAlign: 'left',
            }}
          >
            Trustee Company Details
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
              color: '#000000',
              textAlign: 'left',
            }}
          >
            Submit required company documents.
          </Typography>
        </Stack>

        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {kycSectionLoading && (
                <Typography variant="body2" color="text.secondary">
                  Loading required documents...
                </Typography>
              )}

              {kycSectionError && (
                <Typography variant="body2" color="error.main">
                  {typeof kycSectionError === 'string'
                    ? kycSectionError
                    : kycSectionError?.message ||
                      kycSectionError?.error?.message ||
                      'Unable to load required documents'}
                </Typography>
              )}

              {!kycSectionLoading && !kycSectionError && !certificateDoc && (
                <Typography variant="body2" color="error.main">
                  Certificate of Incorporation requirement is missing from backend config.
                </Typography>
              )}

              {!kycSectionLoading && !kycSectionError && !gstDoc && (
                <Typography variant="body2" color="error.main">
                  GST requirement is missing from backend config.
                </Typography>
              )}

              {!kycSectionLoading && !kycSectionError && renderDocumentField(certificateDoc, true)}

              {!kycSectionLoading && !kycSectionError && renderDocumentField(gstDoc, true)}

              {!kycSectionLoading && !kycSectionError && (moaDoc || aoaDoc) && (
                <>
                  <RHFSelect name="moaAoaType" label="Select Document Type">
                    {moaDoc && <MenuItem value="moa">MoA - Memorandum of Association</MenuItem>}
                    {aoaDoc && <MenuItem value="aoa">AoA - Articles of Association</MenuItem>}
                  </RHFSelect>
                  {renderDocumentField(selectedMoaAoaDoc, true)}
                </>
              )}

              {!kycSectionLoading &&
                !kycSectionError &&
                remainingDocuments.map((item) =>
                  renderDocumentField(item, Boolean(item?.isMandatory))
                )}

            </Box>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <LoadingButton
              type="submit"
              color="primary"
              variant="contained"
              loading={isSubmitting}
            >
              Next
            </LoadingButton>
          </Box>
        </FormProvider>
      </Card>

      <KYCFooter />
    </Container>
  );
}

KYCCompanyDetails.propTypes = {
  percent: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
  dataInitializedSteps: PropTypes.array,
  setDataInitializedSteps: PropTypes.func,
};
