import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  getComparator,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { useState, useCallback, useMemo } from 'react';
import PoolPtcTableFiltersResult from '../pool-ptc/pool-ptc-table-filters-result';
import GatewayDistributionCard from './gateway-distribution-card';
import PoolMerchantTableRow from './pool-merchant-table-row';
import PoolMerchantTableToolbar from './pool-merchant-table-toolbar';

const TABLE_HEAD = [
  { id: 'merchantName', label: 'Merchant' },
  { id: 'receivables', label: 'Receivables' },
  { id: 'gateway', label: 'Gateway' },
  { id: 'status', label: 'Status' },
];

const defaultFilters = {
  name: '',
};

export default function PoolMerchantsGatewaysList({ merchants = [], gatewayDistribution = [] }) {
  const table = useTable({ defaultOrderBy: 'merchantName' });
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: merchants,
        comparator: getComparator(table.order, table.orderBy),
        filters,
      }),
    [filters, merchants, table.order, table.orderBy]
  );

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({ ...prevState, [name]: value }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <>
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography variant="h6">Associated Merchants</Typography>
        </Box>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
                  .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                  .map((row) => (
                    <PoolMerchantTableRow key={row.merchantId} row={row} />
                  ))}

                <TableNoData notFound={!dataFiltered.length} />
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

      <Card sx={{ mt: 3, borderRadius: 3 }}>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography variant="h6">Payment Gateway Distribution</Typography>
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {gatewayDistribution.map((item) => (
              <Grid item xs={12} md={4} key={item.gateway}>
                <GatewayDistributionCard item={item} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Card>
    </>
  );
}

PoolMerchantsGatewaysList.propTypes = {
  gatewayDistribution: PropTypes.array,
  merchants: PropTypes.array,
};

function applyFilter({ inputData, comparator, filters }) {
  const { name } = filters;
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
      (item) =>
        String(item.merchantName || '').toLowerCase().includes(searchValue) ||
        String(item.merchantId || '').toLowerCase().includes(searchValue) ||
        String(item.gateway || '').toLowerCase().includes(searchValue) ||
        String(item.status || '').toLowerCase().includes(searchValue)
    );
  }

  return filteredData;
}
