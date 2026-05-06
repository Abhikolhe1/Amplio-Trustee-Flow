import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, Button, Card, MenuItem, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import FormProvider, {
  RHFCustomFileUploadBox,
  RHFSelect,
  RHFTextField,
} from 'src/components/hook-form';
import DocumentCard from 'src/components/card/documentCard';
import Label from 'src/components/label';
import { 
  useGetSpvApplicationStepData, 
  useGetSpvDocument, 
  useGetSpvKycDocumentTypes 
} from 'src/api/spvApplication';
import { useParams } from 'src/routes/hook';
import axiosInstance from 'src/utils/axios';

const FORM_FIELDS = [
  'trustName',
  'trusteeEntity',
  'settlor',
  'governingLaw',
  'trustDuration',
];

const LAW_OPTIONS = [
  { value: 'Indian Trusts Act, 1882 only', label: 'Indian Trusts Act, 1882 only' },
];

const CLAUSE_OPTIONS = [
  { value: 'full', label: 'Full Isolation (Recommended)' },
  { value: 'partial', label: 'Partial Isolation' },
];

const STATUS_LABELS = {
  pending: 'PENDING',
  signed: 'SIGNED',
  locked: 'LOCKED',
  partially_signed: 'PARTIALLY SIGNED',
  not_required: 'NOT REQUIRED',
};

const STATUS_COLORS = {
  pending: 'warning',
  partially_signed: 'info',
  signed: 'success',
  locked: 'default',
  not_required: 'default',
};

const DOCUMENT_ORDER = ['trust_deed', 'information_memorandum', 'escrow_agreement'];
const TRUST_DEED_VALUE = 'trust_deed';

const getSection = (payload, key, fallbackKey) => {
  if (!payload) {
    return payload;
  }

  if (payload?.data) {
    return payload.data;
  }

  const section = payload?.[key] ?? payload?.[fallbackKey];

  if (section?.data) {
    return section.data;
  }

  return section ?? payload;
};

const getBackendSignerStatus = (document, signerKey) => {
  const fieldName = `${signerKey}SignStatus`;
  return document?.[fieldName];
};

const getResolvedSignerStatus = (document, signerKey) =>
  document?.signing?.[signerKey]?.status || getBackendSignerStatus(document?.backendDocument || document, signerKey) || 'pending';

const getSignerEntries = (document) => {
  const screenActions = document?.signingActions?.trustDeedScreen || document?.signingActions?.documentsScreen || {};
  const signing = document?.signing || {};
  const documentValue = document?.spvKycDocumentType?.value || document?.value;
  const trusteeStatus =
    signing?.trustee?.status || getBackendSignerStatus(document?.backendDocument || document, 'trustee');
  const trusteeShowButton =
    typeof screenActions?.showTrusteeSignButton === 'boolean'
      ? screenActions.showTrusteeSignButton
      : trusteeStatus !== 'signed';

  return [
    {
      key: 'trustee',
      label: 'Trustee',
      signer: trusteeStatus
        ? {
          ...(signing?.trustee || {}),
          status: trusteeStatus,
          required: signing?.trustee?.required ?? true,
        }
        : signing?.trustee,
      showSignButton: Boolean(trusteeShowButton),
    },
  ].filter(({ signer, showSignButton }) => signer || showSignButton);
};

const getRequiredSigners = (document) =>
  getSignerEntries(document).filter(({ signer }) => signer?.required !== false);

const areAllRequiredSignersSigned = (document) => {
  const requiredSigners = getRequiredSigners(document);
  return requiredSigners.length > 0 && requiredSigners.every(({ signer }) => signer?.status === 'signed');
};

const getDisplayStatus = (document) => {
  if (areAllRequiredSignersSigned(document)) return 'SIGNED';
  return STATUS_LABELS[document?.overallSigningStatus] || 'PENDING';
};

const buildSignerDescription = (document) => {
  const signerEntries = getSignerEntries(document);

  if (!signerEntries.length) {
    return document?.spvKycDocumentType?.description || 'Pending document execution';
  }

  return signerEntries
    .map(
      ({ label, signer }) =>
        `${label}: ${STATUS_LABELS[signer?.status] || signer?.status?.toUpperCase?.() || 'PENDING'}`
    )
    .join(' | ');
};

const normalizeDocument = (document, documentType) => {
  const trusteeStatus =
    document?.signing?.trustee?.status || getBackendSignerStatus(document, 'trustee') || 'pending';

  const normalizedDocument = {
    id: document?.id || null,
    value: document?.spvKycDocumentType?.value || documentType?.value,
    title: document?.spvKycDocumentType?.name || documentType?.name || 'SPV Document',
    description: buildSignerDescription(document || { spvKycDocumentType: documentType }),
    icon: 'mdi:file-document-outline',
    docLink: document?.media?.fileUrl || '',
    signing: {
      trustee: {
        ...(document?.signing?.trustee || {}),
        status: trusteeStatus,
        required: document?.signing?.trustee?.required ?? true,
      },
    },
    signingActions: document?.signingActions || {},
    overallSigningStatus: document?.overallSigningStatus || 'pending',
    backendDocument: document || null,
  };

  return {
    ...normalizedDocument,
    status: getDisplayStatus(normalizedDocument),
  };
};

const sortDocuments = (documents) =>
  [...documents].sort((left, right) => {
    const leftIndex = DOCUMENT_ORDER.indexOf(left.value);
    const rightIndex = DOCUMENT_ORDER.indexOf(right.value);

    const normalizedLeftIndex = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const normalizedRightIndex = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

    return normalizedLeftIndex - normalizedRightIndex;
  });

const getMediaId = (value) =>
  typeof value === 'string' ? value : value?.id || value?.mediaId || value?._id || '';

const getDefaultFormValues = (stepData) => ({
  trustName: stepData?.trustName || 'Axis Trustee Services Ltd',
  trusteeEntity: stepData?.trusteeEntity || 'Axis Trustee Services Ltd',
  settlor: stepData?.settlor || 'BirbalPlus',
  governingLaw: stepData?.governingLaw || 'Indian Trusts Act, 1882 only',
  trustDuration: stepData?.trustDuration || '',
  stampDutyAndRegistrationId: stepData?.stampDutyAndRegistration || null,
});

function LegelStructureView({ percent, setActiveStepId, saveStepData, isReadOnly }) {
  const params = useParams();
  const { id } = params;
  const { stepData, refreshDetails } = useGetSpvApplicationStepData(id, 'trust_deed');
  const { spvDocuments, refreshDocumentDetails } = useGetSpvDocument(id);
  const { spvKycDocumentTypes } = useGetSpvKycDocumentTypes();

  const [currData, setCurrData] = useState();
  const [documents, setDocuments] = useState([]);
  const [isFirstCardSaved, setIsFirstCardSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const defaultValues = useMemo(() => getDefaultFormValues(currData), [currData]);

  const schema = yup.object().shape({
    trustName: yup.string().required('Trust name is required'),
    trusteeEntity: yup.string().required('Trustee entity is required'),
    settlor: yup.string().required('Settlor is required'),
    governingLaw: yup.string().required('Governing law is required'),
    trustDuration: yup.string().required('Trust duration is required'),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    control,
    getValues,
    reset,
    trigger,
    formState: { isSubmitting },
  } = methods;

  const watchedFieldValues = useWatch({ control, name: FORM_FIELDS });
  const watchedFields = useMemo(() => watchedFieldValues || [], [watchedFieldValues]);
  const watchedStampDuty = useWatch({ control, name: 'stampDutyAndRegistrationId' });
  const stampDutyMediaId =
    getMediaId(watchedStampDuty) || getMediaId(getValues('stampDutyAndRegistrationId'));
  const savedStampDutyMediaId = getMediaId(currData?.stampDutyAndRegistrationId);

  useEffect(() => {
    if (!stepData) return;
    const data = getSection(stepData, 'trustDeed', 'trust_deed');
    setCurrData(data);
    setIsFirstCardSaved(true);
    saveStepData?.(data);
  }, [saveStepData, stepData]);

  useEffect(() => {
    const documentTypes = Array.isArray(spvKycDocumentTypes) ? spvKycDocumentTypes : [];
    const typedDocuments = Array.isArray(spvDocuments) ? spvDocuments : [];
    
    const relevantDocumentTypes = documentTypes.filter((type) => DOCUMENT_ORDER.includes(type?.value));
    const documentsByValue = new Map(
      typedDocuments
        .filter((document) => document?.spvKycDocumentType?.value)
        .map((document) => [document.spvKycDocumentType.value, document])
    );

    if (stepData?.document && !documentsByValue.has(TRUST_DEED_VALUE)) {
      documentsByValue.set(TRUST_DEED_VALUE, stepData.document);
    }

    const mergedDocuments =
      relevantDocumentTypes.length > 0
        ? relevantDocumentTypes.map((documentType) =>
          normalizeDocument(documentsByValue.get(documentType.value), documentType)
        )
        : typedDocuments.map((document) => normalizeDocument(document));

    const nextDocuments = sortDocuments(mergedDocuments);
    setDocuments(nextDocuments);
    saveStepData?.({
      ...(getSection(stepData, 'trustDeed', 'trust_deed') || {}),
      documents: nextDocuments,
    });
  }, [spvDocuments, spvKycDocumentTypes, stepData]);

  const signingRequiredDocuments = useMemo(
    () => documents.filter((doc) => getRequiredSigners(doc).length > 0),
    [documents]
  );

  const allRequiredDocumentsSigned = useMemo(() => {
    if (signingRequiredDocuments.length === 0) return false;

    return signingRequiredDocuments.every((doc) => areAllRequiredSignersSigned(doc));
  }, [signingRequiredDocuments]);

  useEffect(() => {
    const currentStampDutyValue = getValues('stampDutyAndRegistrationId');
    const nextValues = {
      ...defaultValues,
    };

    if (
      getMediaId(currentStampDutyValue) &&
      !getMediaId(currData?.stampDutyAndRegistrationId)
    ) {
      nextValues.stampDutyAndRegistrationId = currentStampDutyValue;
    }

    reset(nextValues);
  }, [currData?.stampDutyAndRegistrationId, defaultValues, getValues, reset]);

  useEffect(() => {
    const filledFields = watchedFields.filter((value) => value !== undefined && value !== null && value !== '').length;
    const formPercent = Math.round((filledFields / FORM_FIELDS.length) * 50);
    
    const executionItemCount = signingRequiredDocuments.length + 1; // docs + stamp duty
    const signedSignerCount = signingRequiredDocuments.filter((document) =>
      areAllRequiredSignersSigned(document)
    ).length;
    const completedExecutionItems = signedSignerCount + (savedStampDutyMediaId ? 1 : 0);
    
    const executionPercent = executionItemCount
      ? Math.round((completedExecutionItems / executionItemCount) * 50)
      : 0;

    percent?.(formPercent + executionPercent);
  }, [documents, percent, savedStampDutyMediaId, watchedFields, signingRequiredDocuments]);

  const buildBasePayload = (values) => ({
    trustName: values.trustName,
    trusteeEntity: values.trusteeEntity,
    settlor: values.settlor,
    governingLaw: values.governingLaw,
    trustDuration: values.trustDuration,
  });

  const buildTrustDeedPayload = (values, overrides = {}) => {
    const payload = {
      ...buildBasePayload(values),
      ...overrides,
    };

    if ('stampDutyAndRegistrationId' in payload) {
      payload.stampDutyAndRegistrationId = getMediaId(payload.stampDutyAndRegistrationId);
    }

    return payload;
  };

  const patchTrustDeedDetails = async (payload) => {
    const res = await axiosInstance.patch(`/spv-pre/trust-deed/${id}`, payload);
    const backendData = res?.data?.details?.trustDeed;
    setCurrData(backendData);
    saveStepData?.(backendData);
    return backendData;
  };

  const handleFirstCardSave = async () => {
    const isValid = await trigger(FORM_FIELDS);
    if (!isValid) return;

    const values = getValues();
    await patchTrustDeedDetails(buildTrustDeedPayload(values));
    setIsFirstCardSaved(true);
    refreshDetails();
  };

  const handleSign = async (document, signerKey) => {
    let documentId = document?.id;
    if (!documentId && document.value === TRUST_DEED_VALUE) {
        const savedData = await patchTrustDeedDetails(buildBasePayload(getValues()));
        documentId = savedData?.document?.id;
    }

    if (!documentId || !signerKey) return;
    if (getResolvedSignerStatus(document, signerKey) === 'signed') return;

    setIsSaving(true);
    try {
      const signedAt = new Date().toISOString();
      const payload = {
        [`${signerKey}SignStatus`]: 'signed',
        [`${signerKey}SignedAt`]: signedAt,
      };

      const res = await axiosInstance.patch(`/spv-pre/documents/${id}/${documentId}`, payload);
      const updatedDocument = normalizeDocument(res?.data?.details?.document);

      refreshDocumentDetails();
      if (document.value === TRUST_DEED_VALUE) {
          refreshDetails();
      }
      
      setDocuments((prev) =>
        prev.map((item) => (item.value === updatedDocument.value ? updatedDocument : item))
      );
    } catch (error) {
      console.error(`Failed to sign document as ${signerKey}`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadSave = async () => {
    if (!stampDutyMediaId) return;

    await patchTrustDeedDetails(buildTrustDeedPayload(getValues(), {
      stampDutyAndRegistrationId: stampDutyMediaId,
    }));
    refreshDetails();
  };

  const getActionButtons = (document) =>
    getSignerEntries(document)
      .filter(({ signer, showSignButton }) => showSignButton && signer && signer.status !== 'signed')
      .map(({ key, label }) => ({
        key: `${document.value}-${key}`,
        label: document.value === TRUST_DEED_VALUE && key === 'trustee' ? 'E-Sign' : `${label} E-Sign`,
        color: 'warning',
        disabled: isSaving || isSubmitting || (!document.id && document.value !== TRUST_DEED_VALUE),
        onClick: () => handleSign(document, key),
      }));

  const getPrimaryAction = (document) => {
    const actions = getActionButtons(document);
    if (actions.length !== 1) return null;
    return actions[0];
  };

  const getSecondaryActions = (document) => {
    const actions = getActionButtons(document);
    return actions.length > 1 ? actions : [];
  };

  const handleNext = async () => {
    const valid = await trigger();
    if (!valid) return;
    if (!allRequiredDocumentsSigned) return;
    if (!savedStampDutyMediaId) return;
    await patchTrustDeedDetails(buildTrustDeedPayload(getValues()));
    setActiveStepId('escrow');
  };

  return (
    <Box component="section">
      <FormProvider methods={methods}>
        <Card>
          <Box display="flex" alignItems="center" sx={{ px: 3, py: 1 }}>
            <Box>
              <Typography variant="h5" color="primary" py={1}>
                Legal Structure & Trust Deed
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generate and execute the Trust Deed, the master legal framework. Escrow can only
                be opened after this is signed.
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ m: 3 }}>
            Save the trust deed details first, then e-sign the generated documents from
            the list below before moving to escrow setup.
          </Alert>

          <Stack spacing={3} p={3}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
            >
              <RHFTextField name="trustName" label="Trust Name (Legal)" inputProps={{
                readOnly: isReadOnly,
              }} />
              <RHFTextField name="trusteeEntity" label="Trustee Entity" inputProps={{
                readOnly: isReadOnly,
              }} />
            </Box>

            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
            >
              <RHFTextField name="settlor" label="Settlor (Platform NBFC)" inputProps={{
                readOnly: isReadOnly,
              }} />
              <RHFSelect name="governingLaw" label="Governing Law*" inputProps={{
                readOnly: isReadOnly,
              }}>
                {LAW_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
            >

              <RHFTextField
                name="trustDuration"
                label="Trust Duration"
                type="text"
                placeholder="5 Years (extendable)"
                inputProps={{
                  readOnly: isReadOnly,

                }}
              />
            </Box>
          </Stack>
          {!isReadOnly && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mr: 3 }}>
              <Button type="button" variant="contained" color="primary" onClick={handleFirstCardSave} disabled={isSubmitting}>
                Save
              </Button>
            </Box>
          )}
        </Card>

        {isFirstCardSaved && (
          <Card sx={{ p: 3, mt: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" color="primary">
                Legal Documents Execution
              </Typography>
            </Box>

            <Stack spacing={2}>
              {documents.map((doc) => {
                const primaryAction = getPrimaryAction(doc);
                const secondaryActions = getSecondaryActions(doc);

                return (
                  <DocumentCard
                    key={doc.value}
                    docLink={doc.docLink}
                    icon={doc.icon}
                    title={doc.title}
                    description={doc.description}
                    status={doc.status}
                    statusColor={STATUS_COLORS[doc.overallSigningStatus] || STATUS_COLORS.pending}
                    showSignButton={Boolean(primaryAction)}
                    onSign={primaryAction?.onClick}
                    signButtonText={primaryAction?.label || 'E-Sign'}
                    signDisabled={primaryAction?.disabled || isSaving}
                    actionButtons={secondaryActions}
                  />
                );
              })}

              <Box mt={3}>
                <Typography variant="subtitle1">Stamp Duty & Registration</Typography>
                <Typography pb={2} variant="body2">
                  Upload the executed stamp duty and registration proof.
                </Typography>
                <RHFCustomFileUploadBox
                  name="stampDutyAndRegistrationId"
                  label="Document Upload"
                  icon="mdi:file-document-outline"
                  accept={{ 'application/pdf': ['.pdf'] }}
                  disabled={isReadOnly}
                />
                {!isReadOnly && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="button"
                      variant="contained"
                      color="primary"
                      onClick={handleUploadSave}
                      disabled={!stampDutyMediaId || isSubmitting}
                    >
                      Save
                    </Button>
                  </Box>)}
              </Box>
            </Stack>
          </Card>
        )}

        {!isReadOnly && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={!isFirstCardSaved || !allRequiredDocumentsSigned || !savedStampDutyMediaId}
            >
              Next
            </Button>
          </Box>
        )}
      </FormProvider>
    </Box>
  );
}

LegelStructureView.propTypes = {
  percent: PropTypes.func.isRequired,
  saveStepData: PropTypes.func,
  setActiveStepId: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool,
};

export default LegelStructureView;
