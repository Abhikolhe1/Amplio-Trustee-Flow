import { Helmet } from 'react-helmet-async';
import SpvStepper from 'src/sections/spv/spv-stepper';


export default function SpvNewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: SPV KYC</title>
      </Helmet>
      <SpvStepper />
    </> 
  );
}
