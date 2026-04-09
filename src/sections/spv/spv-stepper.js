import { useEffect, useState } from 'react';
import { Box, Stack } from '@mui/material';

import { AnimatePresence, m } from 'framer-motion';
import ProgressStepper from 'src/components/progress-stepper/ProgressStepper';
import CreditRating from './credit-rating/credit-rating';
import LegalDocument from './legal-document/legal-document';
import LegelStructureView from './legalStructure/legealStructureView';
import EscrowSetupView from './escrow/escrowSetup';


export default function SpvStepper() {
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

  const [activeStepId, setActiveStepId] = useState('legal_structure');

  const [formData, setFormData] = useState({
    basic_info: {},
    pool_financial: {},
    ptc_parameters: {},
    legal_structure: {},
    escrow_setup: {},
    legal_documents: {},
    credit_rating: {},
    isin_application: {},
    review_Activate: {},
  });


  const [stepsProgress, setStepsProgress] = useState({
    // basic_info: { percent: 0 },
    // pool_financial: { percent: 0 },
    // ptc_parameters: { percent: 0 },
    legal_structure: { percent: 0 },
    escrow_setup: { percent: 0 },
    // legal_documents: { percent: 0 },
    // credit_rating: { percent: 0 },
    // isin_application: { percent: 0 },
    // review_Activate: { percent: 0 }

  });

  useEffect(() => {
    const savedStep = localStorage.getItem('activeStepId');
    const savedForm = localStorage.getItem('formData');
    const savedProgress = localStorage.getItem('stepsProgress');

    if (savedStep) setActiveStepId(savedStep);
    if (savedForm) setFormData(JSON.parse(savedForm));
    if (savedProgress) setStepsProgress(JSON.parse(savedProgress));
  }, []);

  useEffect(() => {
    localStorage.setItem('activeStepId', activeStepId);
  }, [activeStepId]);

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('stepsProgress', JSON.stringify(stepsProgress));
  }, [stepsProgress]);


  const saveStepData = (stepId, data) => {
    setFormData((prev) => {
      return {
        ...prev,
        [stepId]: { ...(prev[stepId] || {}), ...data },
      };
    });
  };

  const updateStepPercent = (stepId, percent) => {
    setStepsProgress((prev) => ({
      ...prev,
      [stepId]: { percent },
    }));
  };

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

  const renderForm = () => {
    switch (activeStepId) {
      // case 'basic_info':
      //   return (
      //     <BasicInfo
      //       currData={formData.basic_info}
      //       percent={(p) => updateStepPercent('basic_info', p)}
      //       setActiveStepId={setActiveStepId}
      //       saveStepData={(data) => saveStepData('basic_info', data)}
      //     />
      //   );

      //  case 'pool_financial':
      //   return (
      //     <PoolFinancials  
      //       percent={(p) => updateStepPercent('pool_financial', p)}
      //       setActiveStepId={() => setActiveStepId('ptc_parameters')}
      //       dataInitializedSteps={dataInitializedSteps}
      //       setDataInitializedSteps={() =>
      //         setDataInitializedSteps((prev) => [...prev, 'pool_financial'])
      //       }
      //     />
      //   );

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

      case 'legal_structure':
        return (
          <LegelStructureView
          currData={formData.legal_structure}
          percent={(p) => updateStepPercent('legal_structure', p)}
          setActiveStepId={setActiveStepId}
          saveStepData={(data) => saveStepData('legal_structure', data)}
            
          />
        );

      case 'escrow_setup':
        return (
          <EscrowSetupView
          currData={formData.escrow_setup}
          percent={(p) => updateStepPercent('escrow_setup', p)}
          setActiveStepId={setActiveStepId}
          saveStepData={(data) => saveStepData('escrow_setup', data)}
          />
        );

      case 'legal_documents':
        return <LegalDocument
         // currData={formData.legal_documents}
          percent={(p) => updateStepPercent('legal_documents', p)}
          setActiveStepId={setActiveStepId}
        
        />;

      case 'credit_rating':
        return (
          <CreditRating
            currData={formData.credit_rating}
            percent={(p) => updateStepPercent('credit_rating', p)}
            setActiveStepId={setActiveStepId}
            saveStepData={(data) => saveStepData('credit_rating', data)}
          
          />
        );

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
