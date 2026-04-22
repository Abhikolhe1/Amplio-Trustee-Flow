import { useEffect, useMemo } from 'react';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import Iconify from 'src/components/iconify';
import { useGetPsp } from 'src/api/psp-master';
import { useGetSpvApplicationStepData } from 'src/api/spvApplication';
import { useParams, useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import FormProvider, { RHFCheckbox } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
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

const getDocumentStatusChipColor = (status) => {
  const normalizedStatus = String(status || '').toLowerCase();

  if (['signed', 'completed', 'verified', 'approved', 'success'].includes(normalizedStatus)) {
    return 'success';
  }

  return 'primary';
};

const getPspLabel = (value, pspOptions = []) => {
  if (!value) return '--';

  if (typeof value === 'object') {
    return value?.label || value?.name || value?.pspName || value?.id || '--';
  }

  const matchedPsp = pspOptions.find((option) => String(option?.id || option?._id) === String(value));

  return matchedPsp?.label || matchedPsp?.name || matchedPsp?.pspName || value;
};

export default function KYCFinalReview({ currData, percent }) {
  const router = useRouter();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const { psp: pspOptions = [] } = useGetPsp();
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

  const ReviewSubmitSchema = Yup.object().shape({
    consent: Yup.boolean().oneOf([true], 'Please confirm before submitting for review'),
  });

  const methods = useForm({
    resolver: yupResolver(ReviewSubmitSchema),
    defaultValues: {
      consent: false,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

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
    { label: 'PSP Partner', value: getPspLabel(basic?.pspMaster || basic?.pspPartner, pspOptions) },
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
        chip: true,
        chipColor: getDocumentStatusChipColor(getDocumentDisplayStatus(doc)),
      }))
    : [{ label: 'Documents', value: '--', chip: true, chipColor: 'primary' }];

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

  const onSubmit = async () => {
    try {
      const response = await axiosInstance.patch(`/spv-pre/review-submit/${id}`);

      enqueueSnackbar(response?.data?.message || 'Review submitted successfully', {
        variant: 'success',
      });

      router.push(paths.dashboard.spvkyc.success);
    } catch (error) {
      enqueueSnackbar(error?.error?.message || error?.message || 'Failed to submit review', {
        variant: 'error',
      });
    }
  };

  return (
    <Container>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Stack spacing={1} textAlign="center" mt={1} mb={3}>
            <Typography variant="h4" color="primary">
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

        
            <Stack spacing={1.5}>
              <RHFCheckbox
                name="consent"
                label={
                  <Typography variant="body2">
                    I agree to electronically sign this application and confirm that I have
                    reviewed all information provided above.
                  </Typography>
                }
              />
            </Stack>
         

          <Stack mt={2} alignItems="flex-end">
            <LoadingButton
              color="primary"
              variant="contained"
              type="submit"
              loading={isSubmitting}
            >
              Submit For Review
            </LoadingButton>
          </Stack>
        </Box>
      </FormProvider>
    </Container>
  );
}

KYCFinalReview.propTypes = {
  currData: PropTypes.any,
  percent: PropTypes.func,
};
