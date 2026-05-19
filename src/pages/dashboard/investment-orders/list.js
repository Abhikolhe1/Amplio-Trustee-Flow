import { Helmet } from 'react-helmet-async';
import InvestmentOrdersListView from 'src/sections/investment-orders/view/investment-orders-list-view';

export default function InvestmentOrdersListPage() {
  return (
    <>
      <Helmet>
        <title>Investor Orders</title>
      </Helmet>
      <InvestmentOrdersListView />
    </>
  );
}
