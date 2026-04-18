import { Box, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import PropTypes from 'prop-types';
import DepositoryCard from '../depository-card';
import IssuanceDetails from '../issuance-details';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import dayjs from 'dayjs';
import { useGetSpvApplicationStepData } from 'src/api/spvApplication';
import { useParams } from 'src/routes/hook';

export default function ISINApplicationView({
  currData,
  allData,
  percent,
  setActiveStepId,
  saveStepData,
}) {
  const { id } = useParams();
  const { stepData: poolFinancialsStepData } = useGetSpvApplicationStepData(id, 'pool_financials');

  console.log('curentData', poolFinancialsStepData)
  const [selectedDepository, setSelectedDepository] = useState(currData?.depositoryId || 'nsdl');
  const creditRatingData = allData?.credit_rating;
  const applicationDate = dayjs(creditRatingData?.ratingDate).format('DD MMM YYYY');

  const ratingObtained = creditRatingData?.creditRatings?.name;
  const creditRatingAgency = creditRatingData?.creditRatingAgencies?.name;

  const creditAgecyWithRating =
    creditRatingAgency && ratingObtained
      ? `${creditRatingAgency}  -  ${ratingObtained}`
      : creditRatingAgency || ratingObtained || '';

  // console.log('rating obtained', ratingObtained);
  const poolData = allData?.pool_financials?.poolLimit
    ? allData.pool_financials
    : poolFinancialsStepData;
  const issueSize = poolData?.poolLimit ?? currData?.issueSize ?? '';

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
          Credit Rating Confirmed — {ratingObtained}. Rated on {applicationDate}. ISIN application
          is now unlocked.
        </Label>
      </Box>
      {/* Depository Card */}
      <DepositoryCard selectedDepository={selectedDepository} onSelect={setSelectedDepository} />

      {/* Issuance Details */}
      <IssuanceDetails
        selectedDepository={selectedDepository}
        creditAgecyWithRating={creditAgecyWithRating}
        issueSize={issueSize}
        currData={currData}
        setActiveStepId={setActiveStepId}
        saveStepData={saveStepData}
        percent={percent}
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
