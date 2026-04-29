import isEqual from 'lodash/isEqual';
import { useState, useMemo, useCallback } from 'react';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// import { useGetSpvApplications } from 'src/api/spv';
import KycTableToolbar from '../kyc-table-toolbar';
import KycTableFiltersResult from '../kyc-table-filters-result';
import KycTableRow from '../kyc-table-row';
import { useGetSpvApplications } from 'src/api/spvApplication';
import axiosInstance from 'src/utils/axios';

const TABLE_HEAD = [
  { id: 'applicationId', label: 'Application Id', width: 300 },
  { id: 'status', label: 'Status', width: 160 },
  { id: 'createdAt', label: 'Create at', width: 160 },
  { id: 'action', label: 'Action', width: 50 },
];

const PUBLISH_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const defaultFilters = {
  name: '',
  publish: [],
  stock: [],
};

const getStatusColor = (code = '') => {
  const normalized = code.toLowerCase();

  if (normalized.includes('basic') || normalized.includes('pending')) {
    return 'warning';
  }

  if (normalized.includes('complete') || normalized.includes('approved') || normalized.includes('active')) {
    return 'success';
  }

  return 'default';
};

const mapApplicationsToRows = (applications) =>
  (applications || []).map((item, index) => ({
    id: item?.id || `${index}`,
    applicationId: item?.id || `SPV-${index + 1}`,
    status: item?.currentStatus?.label || 'Pending',
    statusColor: getStatusColor(item?.currentStatus?.code || item?.currentStatus?.label || ''),
    createdAt: item?.createdAt || new Date().toISOString(),
  }));

export default function KycListView() {
  const router = useRouter();
  const table = useTable();
  const settings = useSettingsContext();

  const { applications, applicationsLoading } = useGetSpvApplications();
  console.log('Applications DATA', applications)

  const [filters, setFilters] = useState(defaultFilters);

  const tableData = useMemo(
    () => mapApplicationsToRows(applications?.applications || applications),
    [applications]
  );

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const denseHeight = table.dense ? 60 : 80;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = !applicationsLoading && !dataFiltered.length;
  const hasApplications = tableData.length > 0;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleViewRow = useCallback(
  (id) => {
    router.push(paths.dashboard.spvkyc.details(id));
  },
  [router]
);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const createSpvApplication = async () => {
    try {
      const response = await axiosInstance.post('/spv-pre/new-application');
      const applicationId = response?.data?.application?.id;

      if (!applicationId) {
        throw new Error('Application id not found in create response');
      }

      router.push(paths.dashboard.spvkyc.details(applicationId));
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={hasApplications ? 'List' : 'SPV Applications'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Spv Kyc', href: paths.dashboard.spvkyc.root },
          { name: 'List', href: paths.dashboard.spvkyc.list },
        ]}
        action={
          hasApplications ? (
            <Button
              // component={RouterLink}
              // href={paths.dashboard.spvkyc.new}
              color="primary"
              variant="contained"
              onClick={createSpvApplication}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Add SPV
            </Button>
          ) : null
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {!applicationsLoading && !hasApplications && (
        <Card sx={{ p: 6, borderRadius: 3 }}>
          <Box
            sx={{
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}
            >
              <Iconify icon="mingcute:add-line" width={34} />
            </Box>

            <Typography variant="h4" color="primary">
              No SPV Applications Yet
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
              Start your first SPV application. Once you click `Add SPV`, we’ll open the stepper
              and create the application from there.
            </Typography>

            <Button
              // component={RouterLink}
              // href={paths.dashboard.spvkyc.new}
              variant="contained"
              size="large"
              onClick={createSpvApplication}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Add SPV
            </Button>
          </Box>
        </Card>
      )}

      {hasApplications && (
        <Card>
          <KycTableToolbar
            filters={filters}
            onFilters={handleFilters}
            stockOptions={PRODUCT_STOCK_OPTIONS}
            publishOptions={PUBLISH_OPTIONS}
          />

          {canReset && (
            <KycTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={0}
                  onSort={table.onSort}
                  onSelectAllRows={() => { }}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <KycTableRow
                        key={row.id}
                        row={row}
                        selected={false}
                        onSelectRow={() => { }}
                        onDeleteRow={() => { }}
                        onViewRow={() => handleViewRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

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
      )}
    </Container>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { name } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  let filtered = stabilizedThis.map((el) => el[0]);

  if (name) {
    filtered = filtered.filter((row) =>
      row.applicationId.toLowerCase().includes(name.toLowerCase())
    );
  }

  return filtered;
}
