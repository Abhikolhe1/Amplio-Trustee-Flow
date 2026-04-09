import { Box, Button, Card, Container, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DepositoryCard from '../depository-card';
import IssuanceDetails from '../issuance-details';
import ApplicationTracker from '../application-tracker';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

export default function ISINApplicationView({ currData, percent, setActiveStepId, saveStepData }) {
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [selectedDepository, setSelectedDepository] = useState(currData?.depositoryId || 'nsdl');

  const handleNextStep = () => {
    saveStepData({
      ...currData,
      depositoryId: selectedDepository,
    });
    setActiveStepId('review_Activate');
  };

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
          Credit Rating Confirmed — CRISIL AA (sf). Rated on 11 Apr 2026. ISIN application is now
          unlocked.
        </Label>
      </Box>
      {/* Depository Card */}
      <DepositoryCard selectedDepository={selectedDepository} onSelect={setSelectedDepository} />
      {/* Issuance Details */}
      <IssuanceDetails
        currData={currData}
        saveStepData={saveStepData}
        percent={(p) => {
          percent(p);
          setIsFormComplete(p === 100);
        }}
      />
      {/* Application Tracker */}
      <ApplicationTracker />
      <Stack mt={2} alignItems="flex-end">
        <Button
          variant="contained"
          color="primary"
          onClick={handleNextStep}
          disabled={!isFormComplete}
        >
          Next
        </Button>
      </Stack>
    </Container>
  );
}

ISINApplicationView.propTypes = {
  currData: PropTypes.any,
  percent: PropTypes.func,
  saveStepData: PropTypes.func.isRequired,
  setActiveStepId: PropTypes.func.isRequired,
};
