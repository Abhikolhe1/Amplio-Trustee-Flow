import { Helmet } from 'react-helmet-async';
import InvestmentOrdersDetailView from 'src/sections/investment-orders/view/investment-orders-detail-view';

export default function InvestmentOrdersDetailsPage() {
  return (
    <>
      <Helmet>
        <title>Order Detail</title>
      </Helmet>
      <InvestmentOrdersDetailView />
    </>
  );
}
