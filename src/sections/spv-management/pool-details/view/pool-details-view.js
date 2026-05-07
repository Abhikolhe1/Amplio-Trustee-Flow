import Alert from '@mui/material/Alert';
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
import { useGetSpvManagementPoolDetails } from 'src/api/spvManagement';
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
  const { pool: apiPool, spv, poolDetailsLoading, poolDetailsError } = useGetSpvManagementPoolDetails(id);

  const pool = useMemo(() => {
    if (!apiPool) {
      return null;
    }

    return buildPoolFromApi(apiPool, spv);
  }, [apiPool, spv]);

  const summaryCards = pool?.summaryCards || [];
  const isApiBackedPool = Boolean(apiPool);

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

      {poolDetailsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getErrorMessage(poolDetailsError, 'Unable to load pool details.')}
        </Alert>
      )}

      {poolDetailsLoading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Loading pool details...
        </Alert>
      )}

      {!poolDetailsLoading && !pool && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          We could not find a pool for this route. If this link came from the backend, the pool
          may not be exposed by the current SPV management endpoints yet.
        </Alert>
      )}

      {isApiBackedPool && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This pool is loaded from the SPV management APIs. Investor, merchant, and transaction
          analytics are not returned by the current backend pool endpoints, so those tabs show
          empty states until more APIs are available.
        </Alert>
      )}

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

function buildPoolFromApi(pool, spv) {
  const availableAmount = Math.max(Number(pool.poolLimit || 0) - Number(pool.outstanding || 0), 0);
  const couponLabel = pool.coupon ? `${pool.coupon}%` : '-';

  return {
    id: pool.poolId,
    name: pool.isCurrentPool ? 'Current Pool' : 'Pool Details',
    subtitle: pool.applicationId || pool.poolId,
    spvId: spv?.spvId,
    associatedSpv: spv?.name || '-',
    status: pool.status,
    summaryCards: [
      { title: 'Pool Value', value: formatCurrency(pool.poolLimit), icon: 'solar:chart-square-bold' },
      { title: 'Outstanding', value: formatCurrency(pool.outstanding), icon: 'solar:wallet-money-bold' },
      { title: 'Utilization', value: formatPercent(pool.utilizationPercent), icon: 'solar:pie-chart-2-bold' },
      { title: 'Coupon', value: couponLabel, icon: 'solar:bill-list-bold' },
    ],
    overview: {
      poolType: pool.isCurrentPool ? 'Current Pool' : 'Pool',
      poolId: pool.poolId,
      createdOn: '-',
      associatedSpv: spv?.name || '-',
      status: pool.status,
    },
    financialSummary: {
      currentPoolValue: formatCurrency(pool.poolLimit),
      deployed: formatCurrency(pool.outstanding),
      available: formatCurrency(availableAmount),
      avgHaircut: '-',
      expectedYield: couponLabel,
    },
    transactionFlow: {
      description:
        'This pool record is loaded from the SPV management APIs. Additional investor, merchant, and transaction flow analytics are not included in the current backend response.',
      steps: [
        {
          title: 'Pool Created',
          description: `Pool application ${pool.applicationId || pool.poolId} is registered against the selected SPV.`,
        },
        {
          title: 'Review Status',
          description: `Review status code ${pool.reviewStatus ?? '-'} is returned by the backend for this pool.`,
        },
        {
          title: 'Utilization Tracking',
          description: `Current utilization is ${formatPercent(pool.utilizationPercent)} based on backend-calculated pool financials.`,
        },
        {
          title: 'Lifecycle Monitoring',
          description: `Pool status is ${pool.status || '-'} with maturity on ${formatDate(pool.maturityDate)}.`,
        },
      ],
    },
    investorDetails: [],
    merchantsGateways: [],
    gatewayDistribution: [],
    transactionFlowSummaryCards: [],
    transactionFlowTransactions: [],
  };
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatPercent(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return `${Number(value)}%`;
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getErrorMessage(error, fallback = 'Something went wrong') {
  if (typeof error === 'string') {
    return error;
  }

  return error?.message || error?.error?.message || fallback;
}
