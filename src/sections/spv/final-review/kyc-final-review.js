import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import Iconify from 'src/components/iconify';
import KycReviewCard from './kyc-review-card';
import { format } from 'date-fns';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

export default function KYCFinalReview({ currData }) {

  const router=useRouter();
  //  Basic Info
  const basic = currData?.basic_info;
  const basicIdentityData = [
    { label: 'SPV Name', value: basic?.spvName || '--' },
    {
      label: 'SPV Legal Structure',
      value: basic?.spvStructure ? basic.spvStructure : '--',
    },
    {
      label: 'PSP Partner',
      value: basic?.pspPartner
        ? basic.pspPartner.charAt(0).toUpperCase() + basic.pspPartner.slice(1)
        : '--',
    },
    { label: 'Originator (NBFC)', value: basic?.originator || '--' },
  ];

  // Pool Financials
  const pool = currData?.pool_financial;
  const poolFinancialsData = [
    {
      label: 'Pool Limit',
      value: pool?.poolLimit ? `Rs. ${Number(pool.poolLimit).toLocaleString('en-IN')}` : '--',
    },
    { label: 'Maturity', value: pool?.maturity ? `${pool.maturity} Months` : '--' },
    {
      label: 'Target Investor Yield',
      value: pool?.targetYield ? `${pool.targetYield}% p.a.` : '--',
    },
    { label: 'Reserve Buffer', value: pool?.reserveBuffer ? `${pool.reserveBuffer}%` : '--' },
    {
      label: 'Cutoff Time',
      value: pool?.cutoffTime ? `${format(new Date(pool.cutoffTime), 'hh:mm a')} IST` : '--',
    },
  ];

  // PTC Parameters
  const ptc = currData?.ptc_parameters;
  const ptcParametersData = [
    { label: 'Face Value per Unit', value: ptc?.faceValue ? `Rs. ${ptc.faceValue}` : '--' },
    {
      label: 'Min Investment',
      value:
        ptc?.minInvestment && ptc?.minUnits
          ? `Rs. ${Number(ptc.minInvestment).toLocaleString('en-IN')} (${Number(
              ptc.minUnits
            ).toLocaleString('en-IN')} units)`
          : '--',
    },
    {
      label: 'Max Units per Investor',
      value: ptc?.maxPtc ? Number(ptc.maxPtc).toLocaleString('en-IN') : '--',
    },
    { label: 'Max Investors per Pool', value: ptc?.maxInvestPool || '--' },
    {
      label: 'Window Frequency',
      value: ptc?.windowFrequency ? `Every ${ptc.windowFrequency} days` : '--',
    },
    // {
    //   label: 'Window Duration',
    //   value: '24 Hrs',
    // },
  ];

  // Legal Trust Deed
  const legal = currData?.legal_structure;
  const legalTrustDeedData = [
    { label: 'Trust Name', value: legal?.trustName || '--' },
    { label: 'Trustee Entity', value: legal?.trusteeEntity || '--' },
    { label: 'Settlor', value: legal?.settlor || '--' },
    { label: 'Trust Duration', value: legal?.trustDuration || '--' },
    { label: 'Governing Law', value: legal?.governingLaw || '--' },
  ];

  // Escrow Setup
  const escrow = currData?.escrow_setup;
  const bankLabelMap = {
    axis: 'Axis Bank',
    hdfc: 'HDFC Bank',
    icici: 'ICICI Bank',
    kotak: 'Kotak Mahindra Bank',
  };

  const generatedEscrowAccounts = escrow?.generatedAccounts || [];
  const escrowAccountsData =
    generatedEscrowAccounts.length > 0
      ? generatedEscrowAccounts.flatMap((account, index) => [
          {
            label: `Account ${index + 1}`,
            value: account?.accountType || account?.accountLabel || '--',
          },
          {
            label: `Account ${index + 1} Bank`,
            value: bankLabelMap[account?.bank] || account?.bank || '--',
          },
          { label: `Account ${index + 1} Branch`, value: account?.location || '--' },
        ])
      : [
          {
            label: 'Bank',
            value: bankLabelMap[escrow?.bank] || escrow?.bank || '--',
          },
          { label: 'Branch / City', value: escrow?.location || '--' },
          { label: 'Verification Method', value: escrow?.verification || '--' },
          { label: 'Expected Setup Time', value: escrow?.expected || '--' },
        ];

  // Documents
  const docs = currData?.legal_documents?.documents || [];
  const documentsUploadData = [
    {
      label: 'Trust Deed',
      value: docs.find((d) => d.title === 'Trust Deed')?.status || '--',
    },
    {
      label: 'Escrow Agreement',
      value: docs.find((d) => d.title === 'Escrow Agreement')?.status || '--',
    },
    {
      label: 'Information Memorandum',
      value: docs.find((d) => d.title === 'Information Memorandum (IM)')?.status || '--',
    },
  ];

  // Credit Rating
  const creditRating = currData?.credit_rating;

  const creditRatingData = [
    { label: 'Credit Rating Agency', value: creditRating?.creditRatingAgency },

    {
      label: 'Rating Date',
      value: creditRating?.ratingDate
        ? format(new Date(creditRating.ratingDate), 'dd MMM yyyy')
        : '--',
    },

    { label: 'Rating Obtained', value: creditRating?.ratingObtained || '--' },
  ];

  const isin = currData?.isin_application;
  const isinApplicationData = [
    { label: 'Depository', value: isin?.depositoryId?.toUpperCase() },
    { label: 'ISIN Number', value: isin?.isinNumber },
    { label: 'Security Type', value: isin?.securityType },
    { label: 'Issue Size', value: isin?.issueSize },

    {
      label: 'Issue Date',
      value: isin?.issueDate ? format(new Date(isin.issueDate), 'dd MMM yyyy') : '--',
    },

    { label: 'Credit Rating', value: isin?.creditRating },
  ];

  const handleSubmit = () => {
    router.push(paths.dashboard.spvkyc.success);
  };
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
          {/* Basix Info */}
          <KycReviewCard
            title="Basic Identity"
            icon={<Iconify icon="mdi:card-account-details-outline" width={24} />}
            data={basicIdentityData}
          />
          {/* Pool Financials  */}
          <KycReviewCard
            title="Pool Financials"
            icon={<Iconify icon="mdi:finance" width={24} />}
            data={poolFinancialsData}
          />

          {/* PTC Parameters */}
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
            title="Escrow & Accounts"
            icon={<Iconify icon="mdi:bank-outline" width={24} />}
            data={escrowAccountsData}
          />
          <KycReviewCard
            title="Documents"
            status="pending"
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
          <Button
            color="primary"
            variant="contained"
            sx={(theme) => ({
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
              },
            })}
            onClick={handleSubmit}
          >
            Activate
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}

KYCFinalReview.propTypes = {
  currData: PropTypes.any,
};
