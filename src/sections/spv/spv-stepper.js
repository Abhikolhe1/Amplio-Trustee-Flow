import { useEffect, useState } from 'react';
import { Box, Stack } from '@mui/material';

import { AnimatePresence, m } from 'framer-motion';
import ProgressStepper from 'src/components/progress-stepper/ProgressStepper';
import BasicInfo from './basic-info/basic-info';
import PoolFinancials from './pool-financials/pool-financials';
import PtcParameters from './ptc-parameters/ptc-parameters';
import CreditRating from './credit-rating/credit-rating';
import LegalDocument from './legal-document/legal-document';
import LegelStructureView from './legalStructure/legealStructureView';
import EscrowSetupView from './escrow/escrowSetup';
import ISINApplicationView from './isin-application/view/isin-application-view';
import KYCFinalReview from './final-review/kyc-final-review';

import { useGetSpvApplication } from 'src/api/spvApplication';
// import { useParams } from 'src/routes/hook';
import { useSearchParams } from "react-router-dom";



export default function SpvStepper({ applicationId }) {
  const [applicationData, setApplicationData] = useState();
  const { application, applicationLoading } = useGetSpvApplication(applicationId);
  const getStepKey = (step) => {
    if (!step) return '';
    return step.code || step.value || '';
  };

  const mapBackendStepToUiStep = (stepCode) =>
    stepCode === 'review_and_submit' || stepCode === 'review_and_activate'
      ? 'review_and_Activate'
      : stepCode;

  const steps = [
    { id: 'spv_basic_info', number: 1, lines: ['Basic', 'Info'] },
    { id: 'pool_financials', number: 2, lines: ['Pool', 'Financial'] },
    { id: 'ptc_parameters', number: 3, lines: ['PTC', 'Parameters'] },
    { id: 'trust_deed', number: 4, lines: ['Legal', 'Structure'] },
    { id: 'escrow', number: 5, lines: ['Escrow', 'Setup'] },
    { id: 'documents', number: 6, lines: ['Legal', 'Documents'] },
    { id: 'credit_rating', number: 7, lines: ['Credit', 'Rating'] },
    { id: 'isin_application', number: 8, lines: ['ISIN', 'Application'] },
    { id: 'review_and_Activate', number: 9, lines: ['Review', 'Activate'] },
  ];

  const [activeStepId, setActiveStepId] = useState('spv_basic_info');

  const [formData, setFormData] = useState({
    spv_basic_info: {},
    pool_financials: {},
    ptc_parameters: {},
    trust_deed: { documents: [] },
    escrow: {},
    documents: { documents: [] },
    credit_rating: {},
    isin_application: {},
    review_and_Activate: {},
  });

  const [stepsProgress, setStepsProgress] = useState({
    spv_basic_info: { percent: 0 },
    pool_financials: { percent: 0 },
    ptc_parameters: { percent: 0 },
    trust_deed: { percent: 0 },
    escrow: { percent: 0 },
    documents: { percent: 0 },
    credit_rating: { percent: 0 },
    isin_application: { percent: 0 },
    review_and_Activate: { percent: 0 },
  });

  //   useEffect(() => {
  //   if (applicationData) {
  //     setActiveStepId(applicationData);
  //   }
  // }, [applicationData]);





  // useEffect(() => {
  //   const savedStep = localStorage.getItem('activeStepId');
  //   const savedProgress = localStorage.getItem('stepsProgress');

  //   if (savedStep) setActiveStepId(savedStep);
  //   if (savedForm) setFormData(JSON.parse(savedForm));
  //   if (savedProgress) setStepsProgress(JSON.parse(savedProgress));
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem('activeStepId', activeStepId);
  //   const savedForm = localStorage.getItem('formData');
  // }, [activeStepId]);

  // useEffect(() => {
  //   localStorage.setItem('formData', JSON.stringify(formData));
  // }, [formData]);

  // useEffect(() => {
  //   localStorage.setItem('stepsProgress', JSON.stringify(stepsProgress));
  // }, [stepsProgress]);

  const saveStepData = (stepId, data) => {
    setFormData((prev) => {
      return {
        ...prev,
        [stepId]: { ...(prev[stepId] || {}), ...data },
      };
    });
  };

  const updateStepPercent = (stepId, percent) => {
    setStepsProgress((prev) => {
      if (prev[stepId]?.percent === percent) {
        return prev;
      }

      return {
        ...prev,
        [stepId]: { percent },
      };
    });
  };

  useEffect(() => {
    if (application && !applicationLoading) {
      if (applicationData) return;
      setApplicationData(application);

      const activeBackendStep = getStepKey(application.activeStep) || 'spv_basic_info';
      const activeUiStep = mapBackendStepToUiStep(activeBackendStep);
      const completedStepCodes =
        application.completedSteps
          ?.map((step) => getStepKey(step))
          .filter((code) => code !== activeBackendStep) || [];

      let currentStep = activeUiStep;

      if (
        completedStepCodes.includes('spv_basic_info')
      ) {
        updateStepPercent('spv_basic_info', 100);
        currentStep = 'pool_financials';
      }

      if (
        completedStepCodes.includes('pool_financials')
      ) {
        updateStepPercent('pool_financials', 100);
        currentStep = 'ptc_parameters';
      }

      if (
        completedStepCodes.includes('ptc_parameters')
      ) {
        updateStepPercent('ptc_parameters', 100);
        currentStep = 'trust_deed';
      }
      if (
        completedStepCodes.includes('trust_deed')
      ) {
        updateStepPercent('trust_deed', 100);
        currentStep = 'escrow';
      }

      if (
        completedStepCodes.includes('escrow')
      ) {
        updateStepPercent('escrow', 100);
        currentStep = 'documents';
      }
      if (
        completedStepCodes.includes('documents')
      ) {
        updateStepPercent('documents', 100);
        currentStep = 'credit_rating';
      }

      if (
        completedStepCodes.includes('credit_rating')
      ) {
        updateStepPercent('credit_rating', 100);
        currentStep = 'isin_application';
      }
      if (
        completedStepCodes.includes('isin_application')
      ) {
        updateStepPercent('isin_application', 100);
        currentStep = 'review_and_Activate';
      }
      if (
        completedStepCodes.includes('review_and_submit') ||
        completedStepCodes.includes('review_and_activate')
      ) {
        updateStepPercent('review_and_Activate', 100);
        currentStep = 'review_and_Activate';
      }

      setActiveStepId(currentStep);

    }
  }, [application, applicationLoading]);
  const handleStepClick = (stepId) => {
    const currentIndex = steps.findIndex((s) => s.id === activeStepId);
    const targetIndex = steps.findIndex((s) => s.id === stepId);

    if (targetIndex === -1) return;

    // Always allow going to the current or any previous step.
    if (targetIndex <= currentIndex) {
      setActiveStepId(stepId);
      return;
    }

    // Allow moving forward one step at a time.
    if (targetIndex === currentIndex + 1) {
      setActiveStepId(stepId);
      return;
    }

    // Prevent skipping multiple steps ahead unless all intermediate steps are complete.
    for (let i = currentIndex + 1; i < targetIndex; i += 1) {
      if ((stepsProgress[steps[i].id]?.percent ?? 0) < 100) {
        return;
      }
    }

    setActiveStepId(stepId);
  };

  // useEffect(() => {
  //   if (application?.activeStep) {
  //     setApplicationData(application?.activeStep.code);
  //   }
  // }, [application])

  const renderForm = () => {
    switch (activeStepId) {
      case 'spv_basic_info':
        return (
          <BasicInfo
            currData={formData.spv_basic_info}
            percent={(p) => updateStepPercent('spv_basic_info', p)}
            setActiveStepId={setActiveStepId}
            saveStepData={(data) => saveStepData('spv_basic_info', data)}
          />
        );

      case 'pool_financials':
        return (
          <PoolFinancials
            currData={formData.pool_financials}
            percent={(p) => updateStepPercent('pool_financials', p)}
            setActiveStepId={setActiveStepId}
            saveStepData={(data) => saveStepData('pool_financials', data)}
          />
        );

      case 'ptc_parameters':
        return (
          <PtcParameters
            currData={formData.ptc_parameters}
            poolData={formData.pool_financials}
            percent={(p) => updateStepPercent('ptc_parameters', p)}
            setActiveStepId={setActiveStepId}
            saveStepData={(data) => saveStepData('ptc_parameters', data)}
          />
        );

      case 'trust_deed':
        return (
          <LegelStructureView
            currData={formData.trust_deed}
            percent={(p) => updateStepPercent('trust_deed', p)}
            setActiveStepId={setActiveStepId}
            saveStepData={(data) => saveStepData('trust_deed', data)}
          />
        );

      case 'escrow':
        return (
          <EscrowSetupView
            currData={formData.escrow}
            percent={(p) => updateStepPercent('escrow', p)}
            setActiveStepId={setActiveStepId}
            saveStepData={(data) => saveStepData('escrow', data)}
          />
        );

      case 'documents':
        return (
          <LegalDocument
            currData={formData.documents}
            percent={(p) => updateStepPercent('documents', p)}
            setActiveStepId={setActiveStepId}
            saveStepData={(data) => saveStepData('documents', data)}
          />
        );

      case 'credit_rating':
        return (
          <CreditRating
            currData={formData.credit_rating}
            percent={(p) => updateStepPercent('credit_rating', p)}
            setActiveStepId={setActiveStepId}
            saveStepData={(data) => saveStepData('credit_rating', data)}
          />
        );

      case 'isin_application':
        return (
          <ISINApplicationView
            currData={formData.isin_application}
            allData={formData}
            percent={(p) => updateStepPercent('isin_application', p)}
            setActiveStepId={setActiveStepId}
            saveStepData={(data) => saveStepData('isin_application', data)}
          />
        );

      case 'review_and_Activate':
        return (
          <KYCFinalReview
            currData={formData}
            percent={(p) => updateStepPercent('review_and_Activate', p)}
            setActiveStepId={setActiveStepId}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* <Box
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1300,
        }}
      >
        <Logo />
      </Box> */}

      <ProgressStepper
        steps={steps}
        activeStepId={activeStepId}
        stepsProgress={stepsProgress}
        onStepClick={handleStepClick}
      />

      <Stack sx={{ mt: 3 }}>
        <AnimatePresence mode="wait">
          <m.div
            key={activeStepId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderForm()}
          </m.div>
        </AnimatePresence>
      </Stack>
    </Box>
  );
}
