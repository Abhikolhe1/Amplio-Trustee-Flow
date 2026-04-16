import { Helmet } from 'react-helmet-async';
import KycListView from 'src/sections/spv/kycList/view/kyc-list-view';
import SpvStepper from 'src/sections/spv/spv-stepper';


export default function SpvListPage() {




  return (
    <>
      <Helmet>
        <title> Dashboard: SPV KYC</title>
      </Helmet>

        <KycListView />
    </> 
  );
}
