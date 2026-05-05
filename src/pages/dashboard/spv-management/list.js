import { Helmet } from 'react-helmet-async';
import { SpvManagementListView } from 'src/sections/spv-management/view';

export default function SpvManagementListPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: SPV Management</title>
      </Helmet>

      <SpvManagementListView />
    </>
  );
}
