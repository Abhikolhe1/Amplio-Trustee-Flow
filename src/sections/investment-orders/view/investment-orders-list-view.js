import isEqual from 'lodash/isEqual';
import { useState, useCallback, useMemo } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
// api
import { useGetAllInvestmentOrders, useGetAllRedemptionOrders } from 'src/api/investment-orders';
//
import InvestmentOrdersTableRow from '../investment-orders-table-row';
import InvestmentOrdersTableToolbar from '../investment-orders-table-toolbar';

// ----------------------------------------------------------------------

const BUY_ACTIVE_STATUSES = [
  'CREATED',
  'AGREEMENT_SIGNED',
  'PAYMENT_PENDING',
  'UTR_SUBMITTED',
  'PAYMENT_UNDER_REVIEW',
];
const SELL_ACTIVE_STATUSES = [
  'REQUESTED',
  'PENDING_SETTLEMENT',
  'READY_FOR_PAYOUT',
  'PAYOUT_PROCESSING',
  'RETRY_PENDING',
];
const ACTIVE_STATUSES = [...BUY_ACTIVE_STATUSES, ...SELL_ACTIVE_STATUSES];

const BUY_FAILED_STATUSES = ['PAYMENT_FAILED', 'PAYMENT_TIMEOUT', 'PTC_FREEZE_EXPIRED'];
const SELL_FAILED_STATUSES = ['FAILED'];
const FAILED_STATUSES = [...BUY_FAILED_STATUSES, ...SELL_FAILED_STATUSES];

const SELL_SUCCESS_STATUSES = ['PAID', 'RECONCILED'];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAYMENT_SUCCESS', label: 'Buy Verified' },
  { value: 'SELL_SUCCESS', label: 'Sell Paid' },
  { value: 'FAILED', label: 'Failed / Expired' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const TABLE_HEAD = [
  { id: 'investorName', label: 'Investor' },
  { id: 'id', label: 'Order' },
  { id: 'spvId', label: 'SPV' },
  { id: 'investmentAmount', label: 'Amount', align: 'right' },
  { id: 'requestedUnits', label: 'Units', align: 'center' },
  { id: 'orderType', label: 'Type', align: 'center' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: '', label: 'Actions', align: 'right' },
];

const defaultFilters = { name: '', status: 'all' };

// ----------------------------------------------------------------------

function getTabLabelColor(tabValue) {
  if (tabValue === 'ACTIVE') return 'warning';
  if (tabValue === 'PAYMENT_SUCCESS' || tabValue === 'SELL_SUCCESS') return 'success';
  if (tabValue === 'FAILED') return 'error';
  return 'default';
}

function getTabCount(allOrders, tabValue) {
  if (tabValue === 'all') return allOrders.length;
  if (tabValue === 'ACTIVE') return allOrders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  if (tabValue === 'FAILED') return allOrders.filter((o) => FAILED_STATUSES.includes(o.status)).length;
  if (tabValue === 'SELL_SUCCESS') return allOrders.filter((o) => SELL_SUCCESS_STATUSES.includes(o.status)).length;
  return allOrders.filter((o) => o.status === tabValue).length;
}

function applyFilter({ inputData, comparator, filters }) {
  const { name, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  inputData = stabilizedThis.map((el) => el[0]);

  if (status === 'ACTIVE') {
    inputData = inputData.filter((o) => ACTIVE_STATUSES.includes(o.status));
  } else if (status === 'FAILED') {
    inputData = inputData.filter((o) => FAILED_STATUSES.includes(o.status));
  } else if (status === 'SELL_SUCCESS') {
    inputData = inputData.filter((o) => SELL_SUCCESS_STATUSES.includes(o.status));
  } else if (status !== 'all') {
    inputData = inputData.filter((o) => o.status === status);
  }

  if (name) {
    const q = name.toLowerCase();
    inputData = inputData.filter(
      (o) =>
        o.id?.toLowerCase().includes(q) ||
        o.spvId?.toLowerCase().includes(q) ||
        o.investorProfileId?.toLowerCase().includes(q) ||
        o.investorName?.toLowerCase().includes(q) ||
        o.investorEmail?.toLowerCase().includes(q) ||
        String(o.investmentAmount ?? '').includes(q)
    );
  }

  return inputData;
}

// ----------------------------------------------------------------------

export default function InvestmentOrdersListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();

  const { orders, ordersLoading, ordersError, refreshOrders } = useGetAllInvestmentOrders();
  const {
    redemptionOrders,
    redemptionOrdersLoading,
    redemptionOrdersError,
    refreshRedemptionOrders,
  } = useGetAllRedemptionOrders();

  const [filters, setFilters] = useState(defaultFilters);

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prev) => ({ ...prev, [name]: value }));
    },
    [table]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleRefreshAll = useCallback(() => {
    refreshOrders();
    refreshRedemptionOrders();
  }, [refreshOrders, refreshRedemptionOrders]);

  // Merge buy and sell orders into a single normalized list
  const allOrders = useMemo(() => {
    const buyOrders = Array.isArray(orders) ? orders : [];
    const sellOrders = Array.isArray(redemptionOrders) ? redemptionOrders : [];

    const normalizedBuy = buyOrders.map((o) => ({
      ...o,
      orderType: 'BUY',
    }));

    const normalizedSell = sellOrders.map((o) => ({
      ...o,
      orderType: 'SELL',
      // normalize field names to match buy order shape
      investmentAmount: o.netPayout ?? 0,
      requestedUnits: o.units ?? 0,
    }));

    // Sort merged list by createdAt descending
    return [...normalizedBuy, ...normalizedSell].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [orders, redemptionOrders]);

  const isLoading = ordersLoading || redemptionOrdersLoading;
  const hasError = ordersError && redemptionOrdersError;

  const dataFiltered = applyFilter({
    inputData: allOrders,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const denseHeight = table.dense ? 34 : 72;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleViewRow = useCallback(
    (row) => {
      if (row.orderType === 'SELL') {
        router.push(paths.dashboard.investmentOrders.detail(`sell-${row.id}`));
      } else {
        router.push(paths.dashboard.investmentOrders.detail(row.id));
      }
    },
    [router]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Investor Orders"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Investor Orders' },
        ]}
        action={
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="eva:refresh-fill" width={16} />}
            onClick={handleRefreshAll}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Refresh
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {hasError && (
        <Stack alignItems="center" spacing={2} sx={{ py: 5 }}>
          <Typography color="error.main">Failed to load investor orders.</Typography>
          <Button variant="outlined" size="small" onClick={handleRefreshAll}>
            Retry
          </Button>
        </Stack>
      )}

      {!hasError && (
        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) =>
                `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={getTabLabelColor(tab.value)}
                  >
                    {getTabCount(allOrders, tab.value)}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <InvestmentOrdersTableToolbar filters={filters} onFilters={handleFilters} />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1020 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 8 }}>
                        <CircularProgress size={32} />
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading &&
                    dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <InvestmentOrdersTableRow
                          key={`${row.orderType}-${row.id}`}
                          row={row}
                          onViewRow={() => handleViewRow(row)}
                        />
                      ))}

                  {!isLoading && (
                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />
                  )}

                  {!isLoading && <TableNoData notFound={notFound} />}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      )}
    </Container>
  );
}
