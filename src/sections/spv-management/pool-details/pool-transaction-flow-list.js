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
import { SummaryDashboardGrid } from 'src/components/summary-card';
import {
  useTable,
  getComparator,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { useState, useCallback, useMemo } from 'react';
import PoolPtcTableFiltersResult from '../pool-ptc/pool-ptc-table-filters-result';
import PoolTransactionFlowTableRow from './pool-transaction-flow-table-row';
import PoolTransactionFlowToolbar from './pool-transaction-flow-toolbar';

const TABLE_HEAD = [
  { id: 'id', label: 'Transaction' },
  { id: 'amount', label: 'Amount' },
  { id: 'date', label: 'Date & Time' },
  { id: 'utr', label: 'UTR' },
  { id: 'status', label: 'Status' },
  { id: 'note', label: 'Remark' },
];

const defaultFilters = {
  name: '',
};

export default function PoolTransactionFlowList({ summaryCards = [], transactions = [] }) {
  const table = useTable({ defaultOrderBy: 'date' });
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: transactions,
        comparator: getComparator(table.order, table.orderBy),
        filters,
      }),
    [filters, transactions, table.order, table.orderBy]
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {summaryCards.map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <SummaryDashboardGrid title={item.title} value={item.value} icon={item.icon} />
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography variant="h6">Transaction Flow Visualization</Typography>
        </Box>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1120 }}>
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
                    <PoolTransactionFlowTableRow key={row.id} row={row} />
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
    </>
  );
}

PoolTransactionFlowList.propTypes = {
  summaryCards: PropTypes.array,
  transactions: PropTypes.array,
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
        String(item.id || '').toLowerCase().includes(searchValue) ||
        String(item.path || '').toLowerCase().includes(searchValue) ||
        String(item.utr || '').toLowerCase().includes(searchValue) ||
        String(item.status || '').toLowerCase().includes(searchValue)
    );
  }

  return filteredData;
}
