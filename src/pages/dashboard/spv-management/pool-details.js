import { Helmet } from 'react-helmet-async';
import { PoolDetailsView } from 'src/sections/spv-management/pool-details/view';

export default function SpvPoolDetailsPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Pool Details</title>
      </Helmet>

      <PoolDetailsView />
    </>
  );
}
