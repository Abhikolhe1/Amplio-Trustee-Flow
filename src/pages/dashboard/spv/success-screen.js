import { Helmet } from 'react-helmet-async';
import SpvLiveSuccess from 'src/sections/spv/kyc-success/kyc-success';

export default function SpvSuccess() {

  return (
    <>
      <Helmet>
        <title> Dashboard: Kyc success</title>
      </Helmet>
     <SpvLiveSuccess/>
    </> 
  );
}
