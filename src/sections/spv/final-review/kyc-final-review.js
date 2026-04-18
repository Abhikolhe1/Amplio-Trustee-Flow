import { useEffect, useMemo } from 'react';
import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import Iconify from 'src/components/iconify';
import { useGetSpvApplicationStepData } from 'src/api/spvApplication';
import { useParams, useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import KycReviewCard from './kyc-review-card';

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

const formatDate = (value) => {
  if (!value) return '--';
  try {
    return format(new Date(value), 'dd MMM yyyy');
  } catch (error) {
    return '--';
  }
};

const getDocumentDisplayStatus = (document) => {
  if (document?.trusteeSignStatus === 'signed') return 'SIGNED';
  if (document?.trusteeSignStatus) return String(document.trusteeSignStatus).toUpperCase();
  if (document?.overallSigningStatus) return document.overallSigningStatus.toUpperCase();
  if (document?.status) return document.status;
  return '--';
};

export default function KYCFinalReview({ currData, percent }) {
  const router = useRouter();
  const { id } = useParams();
  const { stepData: basicStepData } = useGetSpvApplicationStepData(id, 'spv_basic_info');
  const { stepData: poolStepData } = useGetSpvApplicationStepData(id, 'pool_financials');
  const { stepData: ptcStepData } = useGetSpvApplicationStepData(id, 'ptc_parameters');
  const { stepData: trustDeedStepData } = useGetSpvApplicationStepData(id, 'trust_deed');
  const { stepData: escrowStepData } = useGetSpvApplicationStepData(id, 'escrow');
  const { stepData: documentsStepData } = useGetSpvApplicationStepData(id, 'documents');
  const { stepData: creditRatingStepData } = useGetSpvApplicationStepData(id, 'credit_rating');
  const { stepData: isinStepData } = useGetSpvApplicationStepData(id, 'isin_application');
  const localData = useMemo(() => currData || {}, [currData]);

  useEffect(() => {
    percent?.(100);
  }, [percent]);

  const basic =
    getSection(basicStepData, 'basicInfo', 'spv_basic_info') ||
    localData?.spv_basic_info ||
    localData?.basicInfo;
  const pool =
    getSection(poolStepData, 'poolFinancials', 'pool_financials') || localData?.pool_financials;
  const ptc =
    getSection(ptcStepData, 'ptcParameters', 'ptc_parameters') || localData?.ptc_parameters;
  const legal =
    getSection(trustDeedStepData, 'trustDeed', 'trust_deed') || localData?.trust_deed;
  const escrow = getSection(escrowStepData, 'escrow', 'escrow') || localData?.escrow;
  const escrowAccounts = Array.isArray(escrow)
    ? escrow
    : escrow?.accounts || escrow?.generatedAccounts || (escrow ? [escrow] : []);
  const documents =
    getSection(documentsStepData, 'documents', 'documents') ||
    localData?.documents?.documents ||
    localData?.documents ||
    [];
  const creditRating =
    getSection(creditRatingStepData, 'creditRating', 'credit_rating') || localData?.credit_rating;
  const isin =
    getSection(isinStepData, 'isinApplication', 'isin_application') ||
    localData?.isin_application;

  const basicIdentityData = [
    { label: 'SPV Name', value: basic?.spvName || '--' },
    { label: 'SPV Legal Structure', value: basic?.legalStructure || '--' },
    { label: 'PSP Partner', value: basic?.pspPartner || '--' },
    { label: 'Originator (NBFC)', value: basic?.originatorName || '--' },
  ];

  const poolFinancialsData = [
    {
      label: 'Pool Limit',
      value: pool?.poolLimit ? `Rs. ${Number(pool.poolLimit).toLocaleString('en-IN')}` : '--',
    },
    { label: 'Maturity', value: pool?.maturityDays ? `${pool.maturityDays} Months` : '--' },
    {
      label: 'Target Investor Yield',
      value: pool?.targetYield ? `${pool.targetYield}% p.a.` : '--',
    },
    {
      label: 'Reserve Buffer',
      value: pool?.reserveBufferPercent ? `${pool.reserveBufferPercent}%` : '--',
    },
    {
      label: 'Cutoff Time',
      value: pool?.dailyCutoffTime ? format(new Date(pool.dailyCutoffTime), 'hh:mm a') : '--',
    },
  ];

  const ptcParametersData = [
    {
      label: 'Face Value per Unit',
      value: ptc?.faceValuePerUnit ? `Rs. ${Number(ptc.faceValuePerUnit).toLocaleString('en-IN')}` : '--',
    },
    {
      label: 'Min Investment',
      value: ptc?.minInvestment ? `Rs. ${Number(ptc.minInvestment).toLocaleString('en-IN')}` : '--',
    },
    {
      label: 'Max Units per Investor',
      value: ptc?.maxUnitsPerInvestor ? Number(ptc.maxUnitsPerInvestor).toLocaleString('en-IN') : '--',
    },
    { label: 'Max Investors per Pool', value: ptc?.maxInvestors || '--' },
    {
      label: 'Window Frequency',
      value: ptc?.windowFrequency ? `Every ${ptc.windowFrequency} days` : '--',
    },
  ];

  const legalTrustDeedData = [
    { label: 'Trust Name', value: legal?.trustName || '--' },
    { label: 'Trustee Entity', value: legal?.trusteeEntity || '--' },
    { label: 'Settlor', value: legal?.settlor || '--' },
    { label: 'Trust Duration', value: legal?.trustDuration || '--' },
    { label: 'Governing Law', value: legal?.governingLaw || '--' },
  ];

  const escrowAccountsData = escrowAccounts.length
    ? escrowAccounts.flatMap((account, index) => [
        { label: `Account ${index + 1} Type`, value: account?.accountType || '--' },
        { label: `Account ${index + 1} Bank`, value: account?.bankName || '--' },
        { label: `Account ${index + 1} Branch Details`, value: account?.branchDetails || '--' },
        { label: `Account ${index + 1} Account Number`, value: account?.accountNumber || '--' },
        { label: `Account ${index + 1} IFSC Code`, value: account?.ifscCode || '--' },
      ])
    : [{ label: 'Escrow Accounts', value: '--' }];

  const documentsUploadData = documents.length
    ? documents.map((doc) => ({
        label:
          doc?.spvKycDocumentType?.name ||
          doc?.title ||
          doc?.value ||
          doc?.spvKycDocumentType?.value ||
          'Document',
        value: getDocumentDisplayStatus(doc),
      }))
    : [{ label: 'Documents', value: '--' }];

  const creditRatingData = [
    { label: 'Credit Rating Agency', value: creditRating?.creditRatingAgencies?.name || '--' },
    { label: 'Rating Date', value: formatDate(creditRating?.ratingDate) },
    { label: 'Rating Obtained', value: creditRating?.creditRatings?.name || '--' },
  ];

  const isinApplicationData = [
    { label: 'Depository', value: isin?.depositoryId?.toUpperCase() || '--' },
    { label: 'ISIN Number', value: isin?.isinNumber || '--' },
    { label: 'Security Type', value: isin?.securityType || '--' },
    { label: 'Issue Size', value: isin?.issueSize || '--' },
    { label: 'Issue Date', value: formatDate(isin?.issueDate) },
    { label: 'Credit Rating', value: isin?.creditRating || '--' },
  ];

  const handleSubmit = () => {
    router.push(paths.dashboard.spvkyc.success);
  };

  return (
    <Container>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Stack spacing={1} textAlign="center" mt={1} mb={3}>
          <Typography variant="h4"  color="primary">
            Review & Activate
          </Typography>
          <Typography variant="subtitle2">
            Final review of all SPV parameters before activation.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <KycReviewCard
            title="Basic Identity"
            icon={<Iconify icon="mdi:card-account-details-outline" width={24} />}
            data={basicIdentityData}
          />
          <KycReviewCard
            title="Pool Financials"
            icon={<Iconify icon="mdi:finance" width={24} />}
            data={poolFinancialsData}
          />
          <KycReviewCard
            title="PTC Parameters"
            icon={<Iconify icon="mdi:tune-variant" width={24} />}
            data={ptcParametersData}
          />
          <KycReviewCard
            title="Legal & Trust Deed"
            icon={<Iconify icon="mdi:scale-balance" width={24} />}
            data={legalTrustDeedData}
          />
          <KycReviewCard
            title="Escrow Setup"
            icon={<Iconify icon="mdi:bank-outline" width={24} />}
            data={escrowAccountsData}
          />
          <KycReviewCard
            title="Documents"
            icon={<Iconify icon="mdi:file-document-outline" width={24} />}
            data={documentsUploadData}
          />
          <KycReviewCard
            title="Credit Rating"
            icon={<Iconify icon="mdi:star-check-outline" width={24} />}
            data={creditRatingData}
          />
          <KycReviewCard
            title="ISIN Application"
            icon={<Iconify icon="mdi:file-certificate-outline" width={24} />}
            data={isinApplicationData}
          />
        </Grid>

        <Stack mt={2} alignItems="flex-end">
          <Button color="primary" variant="contained" onClick={handleSubmit}>
            Activate
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}

KYCFinalReview.propTypes = {
  currData: PropTypes.any,
  percent: PropTypes.func,
};
