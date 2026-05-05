import { Helmet } from 'react-helmet-async';
import SPVDetailsView from 'src/sections/spv-management/view/spv-management-details-';

export default function SpvManagementDetailsPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: SPV Details</title>
      </Helmet>

      <SPVDetailsView />
    </>
  );
}
