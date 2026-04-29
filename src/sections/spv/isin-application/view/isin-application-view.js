import { Box, Container, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import DepositoryCard from '../depository-card';
import IssuanceDetails from '../issuance-details';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import dayjs from 'dayjs';
import { useGetSpvApplicationStepData } from 'src/api/spvApplication';
import { useParams } from 'src/routes/hook';

const getIsinData = (stepData) => {
  if (!stepData) return null;
  if (stepData?.data) return getIsinData(stepData.data);
  if (stepData?.isinApplication) return getIsinData(stepData.isinApplication);
  return Object.keys(stepData || {}).length ? stepData : null;
};

const getStorageKey = (id, key) => `spv:${id}:isin:${key}`;

const readStoredJson = (key) => {
  if (typeof window === 'undefined') return null;

  const rawValue = sessionStorage.getItem(key) || localStorage.getItem(key);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return null;
  }
};

const writeStoredJson = (key, value) => {
  if (typeof window === 'undefined' || !value || !Object.keys(value).length) return;

  const serializedValue = JSON.stringify(value);
  sessionStorage.setItem(key, serializedValue);
  localStorage.setItem(key, serializedValue);
};

const clearStoredJson = (key) => {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
};

export default function ISINApplicationView({
  currData,
  allData,
  percent,
  setActiveStepId,
  saveStepData,
  isReadOnly
}) {
  const { id } = useParams();
  const { stepData: poolFinancialsStepData } = useGetSpvApplicationStepData(id, 'pool_financials');
  const { stepData: creditRatingStepData } = useGetSpvApplicationStepData(id, 'credit_rating');
  const { stepData: isinStepData } = useGetSpvApplicationStepData(id, 'isin_application');
  const storedPoolFinancials = useMemo(
    () => readStoredJson(getStorageKey(id, 'pool_financials')),
    [id]
  );
  const storedCreditRating = useMemo(
    () => readStoredJson(getStorageKey(id, 'credit_rating')),
    [id]
  );

  const mergedCurrData = useMemo(
    () => getIsinData(isinStepData) || currData || {},
    [currData, isinStepData]
  );
  const [selectedDepository, setSelectedDepository] = useState(mergedCurrData?.depositoryId || 'nsdl');
  const creditRatingData =
    creditRatingStepData ||
    allData?.credit_rating ||
    storedCreditRating ||
    {};
  const applicationDate = creditRatingData?.ratingDate
    ? dayjs(creditRatingData.ratingDate).format('DD MMM YYYY')
    : '';

  const ratingObtained = creditRatingData?.creditRatings?.name;
  const creditRatingAgency = creditRatingData?.creditRatingAgencies?.name;

  const creditAgecyWithRating =
    creditRatingAgency && ratingObtained
      ? `${creditRatingAgency}  -  ${ratingObtained}`
      : creditRatingAgency || ratingObtained || mergedCurrData?.creditRating || '';

  const poolData =
    poolFinancialsStepData ||
    allData?.pool_financials ||
    storedPoolFinancials ||
    {};
  const issueSize = poolData?.poolLimit ?? mergedCurrData?.issueSize ?? '';

  useEffect(() => {
    setSelectedDepository(mergedCurrData?.depositoryId || 'nsdl');
    saveStepData?.(mergedCurrData);
  }, [mergedCurrData, saveStepData]);

  useEffect(() => {
    if (allData?.pool_financials && Object.keys(allData.pool_financials).length) {
      writeStoredJson(getStorageKey(id, 'pool_financials'), allData.pool_financials);
    }

    if (allData?.credit_rating && Object.keys(allData.credit_rating).length) {
      writeStoredJson(getStorageKey(id, 'credit_rating'), allData.credit_rating);
    }
  }, [allData?.credit_rating, allData?.pool_financials, id]);

  useEffect(() => {
    const hasPoolApiData = Boolean(
      poolFinancialsStepData && Object.keys(poolFinancialsStepData).length
    );
    const hasCreditApiData = Boolean(
      creditRatingStepData && Object.keys(creditRatingStepData).length
    );

    if (hasPoolApiData) {
      clearStoredJson(getStorageKey(id, 'pool_financials'));
    }

    if (hasCreditApiData) {
      clearStoredJson(getStorageKey(id, 'credit_rating'));
    }
  }, [creditRatingStepData, id, poolFinancialsStepData]);

  // const handleNextStep = () => {};

  return (
    <Container>
      <Stack spacing={1} mt={1} mb={3}>
        <Typography variant="h4" color="primary">
          ISIN Application
        </Typography>
        <Typography variant="subtitle2">
          Apply for an International Securities Identification Number from NSDL or CDSL. The ISIN is
          the unique identifier for PTC trading and Demat crediting.
        </Typography>
      </Stack>

      {/* Confirmation note below title */}
      <Box m={1}>
        <Label
          variant="soft"
          color="success"
          sx={{
            p: 2.5,
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            gap: 2,
          }}
        >
          <Iconify icon="mdi:check-circle" width={18} />
          Credit Rating Confirmed — {creditAgecyWithRating || '--'}
          {applicationDate ? `. Rated on ${applicationDate}.` : '.'} ISIN application is now unlocked.
        </Label>
      </Box>
      {/* Depository Card */}
      <DepositoryCard isReadOnly ={isReadOnly} selectedDepository={selectedDepository} onSelect={setSelectedDepository} />

      {/* Issuance Details */}
      <IssuanceDetails
        selectedDepository={selectedDepository}
        creditAgecyWithRating={creditAgecyWithRating}
        issueSize={issueSize}
        currData={mergedCurrData}
        setActiveStepId={setActiveStepId}
        saveStepData={saveStepData}
        percent={percent}
        isReadOnly ={isReadOnly}
      />

      {/* Application Tracker */}
      {/* <ApplicationTracker /> */}

      {/* <Stack mt={2} alignItems="flex-end">
        <Button
          variant="contained"
          color="primary"
          onClick={handleNextStep}
          // disabled={!isFormComplete}
        >
          Next
        </Button>
      </Stack> */}
    </Container>
  );
}

ISINApplicationView.propTypes = {
  allData: PropTypes.any,
  currData: PropTypes.any,
  percent: PropTypes.func,
  saveStepData: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
};
