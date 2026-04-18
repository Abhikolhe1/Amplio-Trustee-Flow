import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hook';
import KycListView from 'src/sections/spv/kycList/view/kyc-list-view';
import SpvStepper from 'src/sections/spv/spv-stepper';


export default function SpvDetailsPage() {
const params = useParams();
  const { id } = params;
  console.log(id);
    return (
        <>
            <Helmet>
                <title> Dashboard: SPV KYC</title>
            </Helmet>
            <SpvStepper applicationId={id} />
        </>
    );
}
