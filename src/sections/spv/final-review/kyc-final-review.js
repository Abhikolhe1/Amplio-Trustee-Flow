import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import Iconify from 'src/components/iconify';
import KycReviewCard from './kyc-review-card';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

const documentsUploadData = [
  { label: 'Trust Deed', value: 'Signed' },
  { label: 'Escrow Agreement', value: 'Draft' },
  { label: 'Information Memorandum', value: 'Required' },
];

export default function KYCFinalReview({ currData }) {
  const basic = currData?.basic_info;
  const basicIdentityData = [
    {
      label: 'SPV Name',
      value: basic?.spvName || '--',
    },
    {
      label: 'SPV Legal Structure',
      value:
        basic?.spvStructure === 'trust'
          ? 'Standalone Passive Vehicle'
          : basic?.spvStructure || '--',
    },
    {
      label: 'PSP Partner',
      value: basic?.pspPartner
        ? basic.pspPartner.charAt(0).toUpperCase() + basic.pspPartner.slice(1)
        : '--',
    },
    {
      label: 'Originator (NBFC)',
      value: basic?.originator || '--',
    },
  ];

  const pool = currData?.pool_financial;
  const poolFinancialsData = [
    {
      label: 'Pool Limit',
      value: pool?.poolLimit ? `₹${Number(pool.poolLimit).toLocaleString('en-IN')}` : '--',
    },
    {
      label: 'Maturity',
      value: pool?.maturity ? `${pool.maturity} days` : '--',
    },
    {
      label: 'Target Investor Yield',
      value: pool?.targetYield ? `${pool.targetYield}% p.a.` : '--',
    },
    {
      label: 'Reserve Buffer',
      value: pool?.reserveBuffer ? `${pool.reserveBuffer}%` : '--',
    },
    {
      label: 'Daily Cutoff',
      value: pool?.cutoffTime ? `${pool.cutoffTime} IST` : '--',
    },
  ];

  const ptc = currData?.ptc_parameters;
  const ptcParametersData = [
    {
      label: 'Face Value per Unit',
      value: ptc?.faceValue ? `₹${ptc.faceValue}` : '--',
    },
    {
      label: 'Min Investment',
      value: ptc?.faceValue ? `₹${ptc.faceValue * 100} (100 units)` : '--', // example logic
    },
    {
      label: 'Max Investors per Pool',
      value: ptc?.maxInvestPool || '--',
    },
    {
      label: 'Window Frequency',
      value: ptc?.windowFrequency ? `Every ${ptc.windowFrequency} days` : '--',
    },
    {
      label: 'Window Duration',
      value: ptc?.windowDuration ? `${ptc.windowDuration} hours` : '--',
    },
  ];

  const legal = currData?.legal_structure;
  const legalTrustDeedData = [
    { label: 'Trust Name', value: legal?.trustName || '--' },
    { label: 'Trustee Entity', value: legal?.trusteeEntity || '--' },
    { label: 'Settlor', value: legal?.settlor || '--' },
    { label: 'Trust Duration', value: legal?.trustDuration || '--' },
    { label: 'Governing Law', value: legal?.governingLaw || '--' },

    // extra fields
    // { label: 'Bankruptcy Status', value: legal?.bankruptcy || '--' },

    // // static (not in localStorage)
    // { label: 'Execution Status', value: 'Pending' },
  ];

  const escrow = currData?.escrow_setup;
  const escrowAccountsData = [
    {
      label: 'Bank',
      value: escrow?.bank === 'axis' ? 'Axis Bank' : escrow?.bank ? escrow.bank : '--',
    },
    { label: 'Branch / City', value: escrow?.location || '--' },
    { label: 'Verification Method', value: escrow?.verification || '--' },
    { label: 'Expected Setup Time', value: escrow?.expected || '--' },
  ];

  const creditRating = currData?.credit_rating;
  const creditRatingData = [
    { label: 'Credit Rating Agency', value: creditRating?.creditRatingAgency },
    { label: 'Application Number', value: creditRating?.applicationNumber },
    {
      label: 'Application Date',
      value: creditRating?.applicationDate
        ? dayjs(creditRating.applicationDate).format('DD MMM YYYY')
        : '--',
    },
    {
      label: 'Expected  Rating Date',
      value: creditRating?.expectedRatingDate
        ? dayjs(creditRating.expectedRatingDate).format('DD MMM YYYY')
        : '--',
    },
    { label: 'Rating Obtained', value: creditRating?.ratingObtained || '--' },
  ];

  const isin = currData?.isin_application;
  const isinApplicationData = [
    { label: 'Depository', value: isin?.depositoryId?.toUpperCase() },
    { label: 'Security Type', value: isin?.securityType },
    { label: 'Issue Size', value: isin?.issueSize },
    {
      label: 'Issue Date',
      value: isin?.issueDate ? dayjs(isin.issueDate).format('DD MMM YYYY') : '--',
    },
    { label: 'Credit Rating', value: isin?.creditRating },
  ];

  return (
    <Container>
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
        }}
      >
        <Stack spacing={1} mt={1} mb={3}>
          <Typography variant="h4" color="primary">
            Review & Activate
          </Typography>
          <Typography variant="subtitle2">
            Final review of all SPV parameters before activation. Once activated, the pool begins
            accepting transactions from Razorpay T1 settlements.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {/* Basic */}
          <KycReviewCard
            title="Basic Identity"
            icon={<Iconify icon="mdi:card-account-details-outline" width={24} />}
            data={basicIdentityData}
          />

          {/* Pool */}
          <KycReviewCard
            title="Pool Financials"
            icon={<Iconify icon="mdi:finance" width={24} />}
            data={poolFinancialsData}
          />

          {/* PTC */}
          <KycReviewCard
            title="PTC Parameters"
            icon={<Iconify icon="mdi:tune-variant" width={24} />}
            data={ptcParametersData}
          />

          {/* Legal & Trust Deed */}
          <KycReviewCard
            title="Legal & Trust Deed"
            icon={<Iconify icon="mdi:scale-balance" width={24} />}
            data={legalTrustDeedData}
          />
          {/* Escrow */}
          <KycReviewCard
            title="Escrow & Accounts"
            icon={<Iconify icon="mdi:bank-outline" width={24} />}
            data={escrowAccountsData}
          />

          {/* Documents  */}
          <KycReviewCard
            title="Documents"
            status="pending"
            icon={<Iconify icon="mdi:file-document-outline" width={24} />}
            data={documentsUploadData}
          />

          {/* Credit Rating  */}
          <KycReviewCard
            title="Credit Rating"
            icon={<Iconify icon="mdi:star-check-outline" width={24} />}
            data={creditRatingData}
          />

          {/* ISIN  */}
          <KycReviewCard
            title="ISIN Application"
            icon={<Iconify icon="mdi:file-certificate-outline" width={24} />}
            data={isinApplicationData}
          />
        </Grid>
        <Stack mt={2} alignItems="flex-end">
          <Button
            color="primary"
            variant="contained"
            sx={(theme) => ({
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
              },
            })}

            // onClick={}
          >
            Review & Activate
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}

KYCFinalReview.propTypes = {
  currData: PropTypes.any,
  // percent: PropTypes.func,
  // setActiveStepId: PropTypes.func.isRequired,
};
