import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useMemo, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// routes
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hook';
// components
import { SummaryDashboardGrid } from 'src/components/summary-card';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// mock
import { getSpvById } from 'src/_mock/_spv';
//
import { ClosedTransactionsListView } from '../closed-transactions/view';
import SpvEscrowAccountView from '../escrow-account';
import SPVDetailsOverviewView from '../spv-details-overview';
import { PoolPtcListView } from '../pool-ptc/view';
import { TransactionHistoryListView } from '../transaction-history/view';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'escrow_account', label: 'Escrow Account' },
  { value: 'pool_ptc', label: 'Pool & PTC' },
  { value: 'transaction_history', label: 'Transaction History' },
  { value: 'closed_transactions', label: 'Closed Transactions' },
];

export default function SPVDetailsView() {
  const settings = useSettingsContext();
  const { id } = useParams();
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const [currentTab, setCurrentTab] = useState(tab || 'overview');

  const spv = useMemo(() => getSpvById(id), [id]);
  const summaryCards = spv?.summaryCards || [];

  const handleChangeTab = useCallback(
    (event, newValue) => {
      setCurrentTab(newValue);
      router.push({
        search: `?tab=${newValue}`,
      });
    },
    [router]
  );

  const handleViewPool = useCallback((row) => {
    router.push(paths.dashboard.spvManagement.poolDetails(row.id));
  }, [router]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'SPV Management', href: paths.dashboard.spvManagement.list },
          { name: spv?.name || 'SPV Details' },
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

      {currentTab === 'overview' && <SPVDetailsOverviewView spvINR={spv} />}
      {currentTab === 'escrow_account' && <SpvEscrowAccountView escrow={spv?.escrowAccount} />}
      {currentTab === 'pool_ptc' && (
        <PoolPtcListView
          pools={spv?.poolPtc || []}
          conversions={spv?.ptcConversionSummary || []}
          onViewRow={handleViewPool}
        />
      )}
      {currentTab === 'transaction_history' && (
        <TransactionHistoryListView transactions={spv?.transactionHistory || []} />
      )}
      {currentTab === 'closed_transactions' && (
        <ClosedTransactionsListView transactions={spv?.closedTransactions || []} />
      )}

    </Container>
  );
}

