import { useState } from 'react';
import { Box, Stack } from '@mui/material';

import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import Logo from 'src/components/logo';
import ProgressStepper from 'src/components/progress-stepper/ProgressStepper';


export default function SpvStepper() {
  const router = useRouter();
  const steps = [
    { id: 'basic_info', number: 1, lines: ['Basic', 'Info'] },
     { id: 'pool_financial', number: 2, lines: ['Pool', 'Financial'] },
    { id: 'ptc_parameters', number: 3, lines: ['PTC', 'Parameters'] },
    { id: 'legal_structure', number: 4, lines: ['Legal', 'Structure'] },
    { id: 'escrow_setup', number: 5, lines: ['Escrow', 'Setup'] },
    { id: 'legal_documents', number: 6, lines: ['Legal', 'Documents'] },
    { id: 'credit_rating', number: 7, lines: ['Credit', 'Rating'] },
    { id: 'isin_application', number: 8, lines: ['ISIN', 'Application'] },
    { id: 'review_Activate', number: 9, lines: ['Review', 'Activate'] },
  ];

  const [activeStepId, setActiveStepId] = useState('basic_info');
  const [dataInitializedSteps, setDataInitializedSteps] = useState([]);
  const [stepsProgress, setStepsProgress] = useState({
    basic_info: { percent: 0 },
    pool_financial: { percent: 0 },
    ptc_parameters: { percent: 0 },
    legal_structure: { percent: 0 },
    escrow_setup: { percent: 0 },
    legal_documents: { percent: 0 },
    credit_rating: { percent: 0 },
    isin_application: { percent: 0 },
    review_Activate: { percent: 0 }

  });

  const updateStepPercent = (stepId, percent) => {
    setStepsProgress((prev) => ({
      ...prev,
      [stepId]: { percent },
    }));
  };

  const handleStepClick = (stepId) => {
    const index = steps.findIndex((s) => s.id === stepId);

    // Prevent skipping ahead
    for (let i = 0; i < index; i += 1) {
      if (stepsProgress[steps[i].id].percent < 100) return;
    }

    setActiveStepId(stepId);
  };

  const renderForm = () => {
    switch (activeStepId) {
    //   case 'basic_info':
    //     return (
    //       <DocumentDetails
    //         percent={(p) => updateStepPercent('basic_info', p)}
    //         setActiveStepId={() => setActiveStepId('pool_financial')}
    //         dataInitializedSteps={dataInitializedSteps}
    //         setDataInitializedSteps={() =>
    //           setDataInitializedSteps((prev) => [...prev, 'basic_info'])
    //         }
    //       />
    //     );

    //    case 'pool_financial':
    //     return (
    //       <KYCAddressDetails
    //         percent={(p) => updateStepPercent('pool_financial', p)}
    //         setActiveStepId={() => setActiveStepId('ptc_parameters')}
    //         dataInitializedSteps={dataInitializedSteps}
    //         setDataInitializedSteps={() =>
    //           setDataInitializedSteps((prev) => [...prev, 'pool_financial'])
    //         }
    //       />
    //     );

    //   case 'ptc_parameters':
    //     return (
    //       <UbosListView
    //         percent={(p) => updateStepPercent('ptc_parameters', p)}
    //         setActiveStepId={() => setActiveStepId('legal_structure')}
    //         dataInitializedSteps={dataInitializedSteps}
    //         setDataInitializedSteps={() =>
    //           setDataInitializedSteps((prev) => [...prev, 'ptc_parameters'])
    //         }
    //       />
    //     );

    //   case 'legal_structure':
    //     return (
    //       <SignatoriesListView
    //         percent={(p) => updateStepPercent('legal_structure', p)}
    //         setActiveStepId={() => setActiveStepId('escrow_setup')}
    //         dataInitializedSteps={dataInitializedSteps}
    //         setDataInitializedSteps={() =>
    //           setDataInitializedSteps((prev) => [...prev, 'legal_structure'])
    //         }
    //       />
    //     );

    //   case 'escrow_setup':
    //     return (
    //       <InvestorCompliance
    //         percent={(p) => updateStepPercent('escrow_setup', p)}
    //         setActiveStepId={() => setActiveStepId('legal_documents')}
    //         dataInitializedSteps={dataInitializedSteps}
    //         setDataInitializedSteps={() =>
    //           setDataInitializedSteps((prev) => [...prev, 'escrow_setup'])
    //         }
    //       />
    //     );

    //   case 'legal_documents':
    //     return (
    //       <KYCBankDetails
    //         percent={(p) => updateStepPercent('legal_documents', p)}
    //         setActiveStepId={() => setActiveStepId('credit_rating')}
    //         dataInitializedSteps={dataInitializedSteps}
    //         setDataInitializedSteps={() =>
    //           setDataInitializedSteps((prev) => [...prev, 'legal_documents'])
    //         }
    //       />
    //     );

    //   case 'credit_rating':
    //     return (
    //       <OverviewMandateView
    //         percent={(p) => updateStepPercent('credit_rating', p)}
    //         setActiveStepId={() => setActiveStepId('isin_application')}
    //         dataInitializedSteps={dataInitializedSteps}
    //         setDataInitializedSteps={() =>
    //           setDataInitializedSteps((prev) => [...prev, 'credit_rating'])
    //         }
    //       />
    //     );

    //   case 'isin_application':
    //     return (
    //       <KYCAgreement
    //         percent={(p) => updateStepPercent('isin_application', p)}
    //         setActiveStepId={() => setActiveStepId('review_Activate')}
    //         dataInitializedSteps={dataInitializedSteps}
    //         setDataInitializedSteps={() =>
    //           setDataInitializedSteps((prev) => [...prev, 'isin_application'])
    //         } 
    //       />
    //     );

    //   case 'review_Activate':
    //     return (
    //       <KYCFinalReview
    //         percent={(p) => updateStepPercent('review_Activate', p)}
    //         setActiveStepId={() => setActiveStepId('')}
    //         dataInitializedSteps={dataInitializedSteps}
    //         setDataInitializedSteps={() =>
    //           setDataInitializedSteps((prev) => [...prev, 'review_Activate'])
    //         }
    //       />
    //     );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1300,
        }}
      >
        <Logo />
      </Box>

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
