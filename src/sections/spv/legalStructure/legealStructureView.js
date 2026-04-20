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
import { useGetSpvApplicationStepData } from 'src/api/spvApplication';
import { useParams } from 'src/routes/hook';
import axiosInstance from 'src/utils/axios';

const FORM_FIELDS = [
  'trustName',
  'trusteeEntity',
  'settlor',
  'governingLaw',
  'bankruptcyClause',
  'trustDuration',
];

const LAW_OPTIONS = [
  {
    value: 'Indian Trusts Act, 1882 + SARFAESI Act, 2002',
    label: 'Indian Trusts Act, 1882 + SARFAESI Act, 2002',
  },
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
};

const STATUS_COLORS = {
  pending: 'warning',
  partially_signed: 'info',
  signed: 'success',
  locked: 'default',
};

const getBackendSignerStatus = (document, signerKey) => {
  const fieldName = `${signerKey}SignStatus`;
  return document?.[fieldName];
};

const getResolvedSignerStatus = (document, signerKey) =>
  document?.signing?.[signerKey]?.status || getBackendSignerStatus(document, signerKey) || 'pending';

const hasUploadedFile = (value) => {
  if (!value) return false;
  if (typeof value === 'string') return Boolean(value.trim());
  if (Array.isArray(value)) return value.length > 0;
  if (value instanceof File) return true;
  return Boolean(
    value?.id ||
      value?.mediaId ||
      value?._id ||
      value?.fileUrl ||
      value?.name ||
      value?.fileName ||
      value?.fileOriginalName
  );
};

const getMediaId = (value) =>
  typeof value === 'string' ? value : value?.id || value?.mediaId || value?._id || '';

const getDefaultFormValues = (stepData) => ({
  trustName: stepData?.trustName || 'Axis Trustee Services Ltd',
  trusteeEntity: stepData?.trusteeEntity || 'Axis Trustee Services Ltd',
  settlor: stepData?.settlor || 'BirbalPlus',
  governingLaw: stepData?.governingLaw || 'Indian Trusts Act, 1882 + SARFAESI Act, 2002',
  bankruptcyClause: stepData?.bankruptcyClause || 'full',
  trustDuration: stepData?.trustDuration || '',
  stampDutyAndRegistrationId: stepData?.stampDutyAndRegistration || null,
});

const getTrustDeedDocumentCard = (stepData) => stepData?.document || null;

const getSignerEntries = (document, screenKey = 'trustDeedScreen') => {
  const screenActions = document?.signingActions?.[screenKey] || {};
  const signing = document?.signing || {};
  const trusteeStatus = signing?.trustee?.status || getBackendSignerStatus(document, 'trustee');
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

const getRequiredSigners = (document, screenKey = 'trustDeedScreen') =>
  getSignerEntries(document, screenKey).filter(({ signer }) => signer?.required !== false);

const areAllRequiredSignersSigned = (document, screenKey = 'trustDeedScreen') => {
  const requiredSigners = getRequiredSigners(document, screenKey);

  return requiredSigners.length > 0 && requiredSigners.every(({ signer }) => signer?.status === 'signed');
};

const getOverallStatus = (document) => {
  if (areAllRequiredSignersSigned(document)) return 'signed';

  const signerEntries = getRequiredSigners(document);
  if (signerEntries.some(({ signer }) => signer?.status === 'signed')) {
    return 'partially_signed';
  }

  return document?.overallSigningStatus || 'pending';
};

const buildDocumentDescription = (document, documentName) => {
  const signerEntries = getSignerEntries(document);

  if (!signerEntries.length) {
    return `Document: ${documentName}`;
  }

  return `${documentName} | ${signerEntries
    .map(
      ({ label, signer }) =>
        `${label}: ${STATUS_LABELS[signer?.status] || signer?.status?.toUpperCase?.() || 'PENDING'}`
    )
    .join(' | ')}`;
};

const normalizeTrustDeed = (data) => {
  if (!data) return data;

  const document = data?.document || null;
  const trusteeStatus = document?.signing?.trustee?.status || 'pending';
  const trusteeSignedAt = document?.signing?.trustee?.signedAt || null;
  const fallbackTrusteeStatus = getBackendSignerStatus(document, 'trustee') || trusteeStatus;

  return {
    ...data,
    document,
    signing: {
      trustee: {
        status: fallbackTrusteeStatus,
        signedAt: trusteeSignedAt,
      },
    },
    overallSigningStatus: getOverallStatus(document),
  };
};

function LegelStructureView({ percent, setActiveStepId, saveStepData }) {
  const params = useParams();
  const { id } = params;
  const { stepData, refreshDetails } = useGetSpvApplicationStepData(id, 'trust_deed');
  const [currData, setCurrData] = useState();
  const [isFirstCardSaved, setIsFirstCardSaved] = useState(false);
  const defaultValues = useMemo(() => getDefaultFormValues(currData), [currData]);

  const schema = yup.object().shape({
    trustName: yup.string().required('Trust name is required'),
    trusteeEntity: yup.string().required('Trustee entity is required'),
    settlor: yup.string().required('Settlor is required'),
    governingLaw: yup.string().required('Governing law is required'),
    bankruptcyClause: yup.string().required('Bankruptcy clause is required'),
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
    const normalizedData = normalizeTrustDeed(stepData);
    setCurrData(normalizedData);
    setIsFirstCardSaved(true);
    saveStepData?.(normalizedData);
  }, [saveStepData, stepData]);

  useEffect(() => {
    const currentStampDutyValue = getValues('stampDutyAndRegistrationId');
    const nextValues = {
      ...defaultValues,
    };

    // Preserve an uploaded-but-not-yet-saved file when backend refreshes this step.
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
    const requiredSigners = getRequiredSigners(currData?.document);
    const signedSignerCount = requiredSigners.filter(({ signer }) => signer?.status === 'signed').length;
    const executionItemCount = requiredSigners.length + 1;
    const completedExecutionItems =
      signedSignerCount + (savedStampDutyMediaId ? 1 : 0);
    const executionPercent = executionItemCount
      ? Math.round((completedExecutionItems / executionItemCount) * 50)
      : 0;

    percent?.(formPercent + executionPercent);
  }, [currData?.document, percent, savedStampDutyMediaId, watchedFields]);

  const trustDeedDocument = getTrustDeedDocumentCard(currData);
  const documentUrl = trustDeedDocument?.media?.fileUrl || '';
  const documentName =
    trustDeedDocument?.media?.fileOriginalName || trustDeedDocument?.media?.fileName || 'Trust deed';
  const overallStatus = currData?.overallSigningStatus || 'pending';
  const allRequiredSignersSigned = areAllRequiredSignersSigned(trustDeedDocument);

  const buildBasePayload = (values) => ({
    trustName: values.trustName,
    trusteeEntity: values.trusteeEntity,
    settlor: values.settlor,
    governingLaw: values.governingLaw,
    bankruptcyClause: values.bankruptcyClause,
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
    const normalized = normalizeTrustDeed(backendData);
    setCurrData(normalized);
    saveStepData?.(normalized);

    return normalized;
  };

  const patchTrustDeedDocumentStatus = async (payload) => {
    let documentId = currData?.document?.id;

    if (!documentId) {
      const savedData = await patchTrustDeedDetails(buildBasePayload(getValues()));
      documentId = savedData?.document?.id;
      if (!documentId) return savedData;
    }

    const endpoint = `/spv-pre/documents/${id}/${documentId}`;
    const res = await axiosInstance.patch(endpoint, payload);
    const document = res?.data?.details?.document;
    refreshDetails();
    const nextData = normalizeTrustDeed({
      ...currData,
      document,
    });

    setCurrData(nextData);
    saveStepData?.(nextData);

    return nextData;
  };

  const handleFirstCardSave = async () => {
    const isValid = await trigger(FORM_FIELDS);
    if (!isValid) return;

    const values = getValues();
    await patchTrustDeedDetails(buildTrustDeedPayload(values));
    setIsFirstCardSaved(true);
  };

  const handleSignerSign = async (signerKey) => {
    if (!trustDeedDocument?.id) return;

    const signerStatus = getResolvedSignerStatus(trustDeedDocument, signerKey);
    if (signerStatus === 'signed') return;

    const signedAt = new Date().toISOString();
    await patchTrustDeedDocumentStatus({
      [`${signerKey}SignStatus`]: 'signed',
      [`${signerKey}SignedAt`]: signedAt,
    });
  };

  const handleUploadSave = async () => {
    if (!stampDutyMediaId) return;

    await patchTrustDeedDetails(buildTrustDeedPayload(getValues(), {
      stampDutyAndRegistrationId: stampDutyMediaId,
    }));
    refreshDetails();
  };

  const trustDeedActionButtons = getSignerEntries(trustDeedDocument)
    .filter(({ key, signer, showSignButton }) => {
      if (!showSignButton || !signer || signer.status === 'signed') return false;
      return true;
    })
    .map(({ key, label }) => ({
      key,
      label: key === 'trustee' ? 'E-Sign' : `${label} E-Sign`,
      color: 'warning',
      disabled: isSubmitting,
      onClick: () => handleSignerSign(key),
    }));

  const primaryTrustDeedAction =
    trustDeedActionButtons.length === 1 ? trustDeedActionButtons[0] : null;
  const secondaryTrustDeedActions =
    trustDeedActionButtons.length > 1 ? trustDeedActionButtons : [];

  const handleNext = async () => {
    const valid = await trigger();
    if (!valid) return;
    if (!allRequiredSignersSigned) return;
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
            Save the trust deed details first, then e-sign the generated trust deed document from
            the card below before moving to escrow setup.
          </Alert>

          <Stack spacing={3} p={3}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
            >
              <RHFTextField name="trustName" label="Trust Name (Legal)" disabled />
              <RHFTextField name="trusteeEntity" label="Trustee Entity" disabled />
            </Box>

            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
            >
              <RHFTextField name="settlor" label="Settlor (Platform NBFC)" disabled />
              <RHFSelect name="governingLaw" label="Governing Law*">
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
              <Box>
                <RHFSelect name="bankruptcyClause" label="Bankruptcy Remoteness Clause*">
                  {CLAUSE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
                <Typography variant="body2" mt={1} color="text.secondary">
                  Full isolation protects investors if the platform defaults.
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
            <Button type="button" variant="contained" color="primary" onClick={handleFirstCardSave}>
              Save
            </Button>
          </Box>
        </Card>

        {isFirstCardSaved && (
          <Card sx={{ p: 3, mt: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" color="primary">
                Execution Status
              </Typography>
              <Label color={STATUS_COLORS[overallStatus] || 'warning'}>
                {STATUS_LABELS[overallStatus] || overallStatus}
              </Label>
            </Box>

            <Stack spacing={2}>
              <DocumentCard
                title="Trust Deed"
                description={buildDocumentDescription(trustDeedDocument, documentName)}
                icon="mdi:file-document-outline"
                status={STATUS_LABELS[overallStatus] || overallStatus?.toUpperCase()}
                statusColor={STATUS_COLORS[overallStatus] || 'warning'}
                docLink={documentUrl}
                showViewButton={Boolean(documentUrl)}
                showSignButton={Boolean(primaryTrustDeedAction)}
                onSign={primaryTrustDeedAction?.onClick}
                signButtonText={primaryTrustDeedAction?.label || 'E-Sign'}
                signDisabled={primaryTrustDeedAction?.disabled || isSubmitting}
                actionButtons={secondaryTrustDeedActions}
              />

              <Box>
                <Typography variant="subtitle1">Stamp Duty & Registration</Typography>
                <Typography pb={2} variant="body2">
                  Upload the executed stamp duty and registration proof.
                </Typography>
                <RHFCustomFileUploadBox
                  name="stampDutyAndRegistrationId"
                  label="Document Upload"
                  icon="mdi:file-document-outline"
                  accept={{ 'application/pdf': ['.pdf'] }}
                />
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
                </Box>
              </Box>
            </Stack>
          </Card>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={!isFirstCardSaved || !allRequiredSignersSigned || !savedStampDutyMediaId}
          >
            Next
          </Button>
        </Box>
      </FormProvider>
    </Box>
  );
}

LegelStructureView.propTypes = {
  percent: PropTypes.func.isRequired,
  saveStepData: PropTypes.func,
  setActiveStepId: PropTypes.func.isRequired,
};

export default LegelStructureView;
