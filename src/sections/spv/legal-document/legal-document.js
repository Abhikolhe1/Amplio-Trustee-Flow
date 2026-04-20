import { Box, Button, Card, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import DocumentCard from 'src/components/card/documentCard';
import {
  useGetSpvApplicationStepData,
  useGetSpvDocument,
  useGetSpvKycDocumentTypes,
} from 'src/api/spvApplication';
import axiosInstance from 'src/utils/axios';
import { useParams } from 'src/routes/hook';

const STATUS_LABELS = {
  signed: 'SIGNED',
  pending: 'PENDING',
  locked: 'LOCKED',
  not_required: 'NOT REQUIRED',
  partially_signed: 'PARTIALLY SIGNED',
};

const STATUS_COLORS = {
  signed: 'success',
  pending: 'warning',
  locked: 'default',
  not_required: 'default',
  partially_signed: 'info',
};

const DOCUMENT_ORDER = ['trust_deed', 'information_memorandum', 'escrow_agreement'];
const TRUST_DEED_VALUE = 'trust_deed';

const getBackendSignerStatus = (document, signerKey) => {
  const fieldName = `${signerKey}SignStatus`;
  return document?.[fieldName];
};

const getResolvedSignerStatus = (document, signerKey) =>
  document?.signing?.[signerKey]?.status || getBackendSignerStatus(document?.backendDocument || document, signerKey) || 'pending';

const getSignerEntries = (document, screenKey = 'documentsScreen') => {
  const screenActions = document?.signingActions?.[screenKey] || {};
  const signing = document?.signing || {};
  const documentValue = document?.spvKycDocumentType?.value || document?.value;
  const trusteeStatus =
    signing?.trustee?.status || getBackendSignerStatus(document?.backendDocument || document, 'trustee');
  const trusteeShowButton =
    typeof screenActions?.showTrusteeSignButton === 'boolean'
      ? screenActions.showTrusteeSignButton
      : documentValue !== TRUST_DEED_VALUE && trusteeStatus !== 'signed';

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
  ].filter(
    ({ signer, showSignButton }) => signer || showSignButton
  );
};

const getRequiredSigners = (document, screenKey = 'documentsScreen') =>
  getSignerEntries(document, screenKey).filter(({ signer }) => signer?.required !== false);

const areAllRequiredSignersSigned = (document, screenKey = 'documentsScreen') => {
  const requiredSigners = getRequiredSigners(document, screenKey);

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

const getStepDocuments = (stepData) => {
  if (Array.isArray(stepData)) return stepData;
  if (Array.isArray(stepData?.documents)) return stepData.documents;
  if (Array.isArray(stepData?.data?.documents)) return stepData.data.documents;
  if (Array.isArray(stepData?.data)) return stepData.data;
  return [];
};

function LegalDocument({ currData, setActiveStepId, percent, saveStepData }) {
  const params = useParams();
  const { id } = params;
  const { stepData } = useGetSpvApplicationStepData(id, 'documents');
  const { spvDocuments, refreshDocumentDetails } = useGetSpvDocument(id);
  const { spvKycDocumentTypes } = useGetSpvKycDocumentTypes();
  const [documents, setDocuments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const typedDocuments = getStepDocuments(stepData).length
      ? getStepDocuments(stepData)
      : Array.isArray(spvDocuments)
        ? spvDocuments
        : Array.isArray(currData?.documents)
          ? currData.documents
          : [];
    const documentTypes = Array.isArray(spvKycDocumentTypes) ? spvKycDocumentTypes : [];

    const relevantDocumentTypes = documentTypes.filter((type) => DOCUMENT_ORDER.includes(type?.value));
    const documentsByValue = new Map(
      typedDocuments
        .filter((document) => document?.spvKycDocumentType?.value)
        .map((document) => [document.spvKycDocumentType.value, document])
    );

    const mergedDocuments =
      relevantDocumentTypes.length > 0
        ? relevantDocumentTypes.map((documentType) =>
            normalizeDocument(documentsByValue.get(documentType.value), documentType)
          )
        : typedDocuments.map((document) => normalizeDocument(document));

    const nextDocuments = sortDocuments(mergedDocuments);

    setDocuments(nextDocuments);
    saveStepData?.({ documents: nextDocuments });
  }, [currData?.documents, saveStepData, spvDocuments, spvKycDocumentTypes, stepData]);

  const signingRequiredDocuments = useMemo(
    () => documents.filter((doc) => getRequiredSigners(doc).length > 0),
    [documents]
  );

  const allRequiredDocumentsSigned = useMemo(
    () =>
      signingRequiredDocuments.length > 0 &&
      signingRequiredDocuments.every((document) => areAllRequiredSignersSigned(document)),
    [signingRequiredDocuments]
  );

  useEffect(() => {
    if (!documents.length) {
      percent?.(0);
      return;
    }

    const completed = signingRequiredDocuments.filter((document) =>
      areAllRequiredSignersSigned(document)
    ).length;
    const total = signingRequiredDocuments.length || 1;
    percent?.(Math.round((completed / total) * 100));
  }, [documents, percent, signingRequiredDocuments]);

  const handleSign = async (document, signerKey) => {
    if (!document?.id || !signerKey) return;
    if (getResolvedSignerStatus(document, signerKey) === 'signed') return;

    setIsSaving(true);
    try {
      const signedAt = new Date().toISOString();
      const payload = {
        [`${signerKey}SignStatus`]: 'signed',
        [`${signerKey}SignedAt`]: signedAt,
      };

      const res = await axiosInstance.patch(`/spv-pre/documents/${id}/${document.id}`, payload);
      const updatedDocument = normalizeDocument(res?.data?.details?.document);
      
refreshDocumentDetails();
      setDocuments((prev) =>
        prev.map((item) => (item.value === updatedDocument.value ? updatedDocument : item))
      );
    } catch (error) {
      console.error(`Failed to sign document as ${signerKey}`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const getActionButtons = (document) =>
    (document?.value === TRUST_DEED_VALUE
      ? []
      : getSignerEntries(document)
    )
      .filter(({ signer, showSignButton }) => showSignButton && signer && signer.status !== 'signed')
      .map(({ key, label }) => ({
        key: `${document.value}-${key}`,
        label: 'E-Sign',
        color: 'warning',
        disabled: isSaving || !document.id,
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

  const handleNext = () => {
    if (!allRequiredDocumentsSigned) return;

    saveStepData?.({ documents });
    setActiveStepId('credit_rating');
  };

  return (
    <Box component="section">
      <Card>
        <Stack spacing={4} p={3}>
          <Box>
            <Typography variant="h4" color="primary" fontWeight={600}>
              Legal Documents
            </Typography>

            <Typography variant="body2" color="text.secondary">
              These records load from the SPV document APIs, and pending documents can now be
              signed directly from this screen before moving ahead.
            </Typography>
          </Box>

          <Stack spacing={2}>
            {documents.map((doc) => (
              (() => {
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
              })()
            ))}
          </Stack>

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={isSaving || !allRequiredDocumentsSigned}
            >
              Next
            </Button>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}

LegalDocument.propTypes = {
  currData: PropTypes.object,
  percent: PropTypes.func,
  saveStepData: PropTypes.func,
  setActiveStepId: PropTypes.func.isRequired,
};

export default LegalDocument;
