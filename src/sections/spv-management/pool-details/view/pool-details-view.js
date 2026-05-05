import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useMemo, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hook';
import { SummaryDashboardGrid } from 'src/components/summary-card';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { getPoolById } from 'src/_mock/_pool-details';
import PoolOverviewTab from '../pool-overview-tab';
import PoolInvestorDetailsList from '../pool-investor-details-list';
import PoolMerchantsGatewaysList from '../pool-merchants-gateways-list';
import PoolTransactionFlowList from '../pool-transaction-flow-list';

const TABS = [
  { value: 'pool_overview', label: 'Pool Overview' },
  { value: 'investor_details', label: 'Investor Details' },
  { value: 'merchants_gateways', label: 'Merchants & Gateways' },
  { value: 'transaction_flow', label: 'Transaction Flow' },
];

export default function PoolDetailsView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const [currentTab, setCurrentTab] = useState(tab || 'pool_overview');

  const pool = useMemo(() => getPoolById(id), [id]);
  const summaryCards = pool?.summaryCards || [];

  const handleChangeTab = useCallback(
    (event, newValue) => {
      setCurrentTab(newValue);
      router.push({ search: `?tab=${newValue}` });
    },
    [router]
  );

  const handleViewInvestor = useCallback(
    (row) => {
      router.push(paths.dashboard.investor.details(row.investorId));
    },
    [router]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={pool?.name || 'Pool Details'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'SPV Management', href: paths.dashboard.spvManagement.list },
          { name: pool?.name || 'Pool Details' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3} sx={{ mb: { xs: 3, md: 5 } }}>
        {summaryCards.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <SummaryDashboardGrid title={item.title} value={item.value} icon={item.icon} />
          </Grid>
        ))}
      </Grid>

      <Tabs value={currentTab} onChange={handleChangeTab} sx={{ mb: { xs: 3, md: 5 } }}>
        {TABS.map((item) => (
          <Tab key={item.value} value={item.value} label={item.label} />
        ))}
      </Tabs>

      {currentTab === 'pool_overview' && <PoolOverviewTab pool={pool} />}
      {currentTab === 'investor_details' && (
        <PoolInvestorDetailsList investors={pool?.investorDetails || []} onViewRow={handleViewInvestor} />
      )}
      {currentTab === 'merchants_gateways' && (
        <PoolMerchantsGatewaysList
          merchants={pool?.merchantsGateways || []}
          gatewayDistribution={pool?.gatewayDistribution || []}
        />
      )}
      {currentTab === 'transaction_flow' && (
        <PoolTransactionFlowList
          summaryCards={pool?.transactionFlowSummaryCards || []}
          transactions={pool?.transactionFlowTransactions || []}
        />
      )}
    </Container>
  );
}
