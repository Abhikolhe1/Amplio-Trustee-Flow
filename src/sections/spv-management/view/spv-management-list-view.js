import { useMemo, useState, useCallback } from 'react';
// @mui
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
// components
import Scrollbar from 'src/components/scrollbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  getComparator,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
//
import { SPV_DATA, SPV_SUMMARY } from 'src/_mock/_spv';
import SpvManagementTableRow from '../spv-management-table-row';
import SpvPoolBuilder from '../spv-pool-builder';
import SpvRecentPtcIssuances from '../spv-recent-ptc-issuances';
import SpvTableToolbar from '../spv-table-toolbar';
import SpvTableFiltersResult from '../spv-table-filters-result';
import { SummaryDashboardGrid } from 'src/components/summary-card';
import { useRouter } from 'src/routes/hook';

const TABLE_HEAD = [
  { id: 'name', label: 'SPV Name' },
  { id: 'status', label: 'Status' },
  { id: 'activePTC', label: 'Active PTC' },
  { id: 'outstandingValue', label: 'Amount' },
  { id: 'coupon', label: 'Coupon' },
  { id: 'maturityDate', label: 'Maturity' },
  { id: '', label: 'Action' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'draft', label: 'Draft' },
  { value: 'closed', label: 'Closed' },
];

const defaultFilters = {
  name: '',
  status: 'all',
};

export default function SpvManagementListView() {
  const settings = useSettingsContext();
  const table = useTable({ defaultOrderBy: 'name' });

  const router = useRouter();

  const [filters, setFilters] = useState(defaultFilters);

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [table]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.spvManagement.details(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: SPV_DATA,
        comparator: getComparator(table.order, table.orderBy),
        filters,
      }),
    [filters, table.order, table.orderBy]
  );

  const canReset = !!filters.name || filters.status !== 'all';
  const notFound = !dataFiltered.length;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="SPV Management"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'SPV Management', href: paths.dashboard.spvManagement.root },
          { name: 'List' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {SPV_SUMMARY.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <SummaryDashboardGrid title={item.title} value={item.value} icon={item.icon} />
          </Grid>
        ))}
      </Grid>

      <Card>
        <SpvTableToolbar
          filters={filters}
          onFilters={handleFilters}
          statusOptions={STATUS_OPTIONS}
        />

        {canReset && (
          <SpvTableFiltersResult
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            results={dataFiltered.length}
            statusOptions={STATUS_OPTIONS}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1200 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={dataFiltered.length}
                numSelected={0}
                onSort={table.onSort}
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <SpvManagementTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      // onDeleteRow={() => handleDeleteRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                    />
                  ))}

                <TableNoData notFound={notFound} />
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

      <SpvPoolBuilder />
      <SpvRecentPtcIssuances />
    </Container>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { name, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filteredData = stabilizedThis.map((el) => el[0]);

  if (name) {
    const searchValue = name.toLowerCase();

    filteredData = filteredData.filter(
      (row) =>
        row.name.toLowerCase().includes(searchValue) ||
        row.issuer.toLowerCase().includes(searchValue) ||
        row.trustee.toLowerCase().includes(searchValue) ||
        row.category.toLowerCase().includes(searchValue)
    );
  }

  if (status !== 'all') {
    filteredData = filteredData.filter((row) => String(row.status || '').toLowerCase() === status);
  }

  return filteredData;
}

