import { Box, Button, Card, Container, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import DepositoryCard from '../depository-card';
import IssuanceDetails from '../issuance-details';
import ApplicationTracker from '../application-tracker';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import dayjs from 'dayjs';

export default function ISINApplicationView({ currData, percent, setActiveStepId, saveStepData }) {
  // const [isFormComplete, setIsFormComplete] = useState(false);
  const [selectedDepository, setSelectedDepository] = useState(currData?.depositoryId || 'nsdl');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const data = localStorage.getItem('formData');
    const formData = JSON.parse(data);
    setFormData(formData);
  }, []);
  const creditRatingData = formData?.credit_rating;
  const applicationDate = dayjs(creditRatingData?.ratingDate).format('DD MMM YYYY');

  const ratingObtained = creditRatingData?.ratingObtained;
  const creditRatingAgency = creditRatingData?.creditRatingAgency;

  const creditAgecyWithRating =
    creditRatingAgency && ratingObtained
      ? `${creditRatingAgency}  -  ${ratingObtained}`
      : creditRatingAgency || ratingObtained || '';

  // console.log('rating obtained', ratingObtained);
  const poolData = formData?.pool_financial;
  const issueSize = poolData?.poolLimit;

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
  currData: PropTypes.any,
  percent: PropTypes.func,
  saveStepData: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
};
