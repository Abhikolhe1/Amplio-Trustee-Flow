import { Helmet } from 'react-helmet-async';
import KycListView from 'src/sections/spv/kycList/view/kyc-list-view';
import SpvStepper from 'src/sections/spv/spv-stepper';


export default function SpvListPage() {

const data = localStorage.getItem('formData');

   console.log("data",data);
  return (
    <>
      <Helmet>
        <title> Dashboard: SPV KYC</title>
      </Helmet>

         {data?<KycListView />:<SpvStepper/>}
    </> 
  );
}
