import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import PoolPtcTableToolbar from '../pool-ptc-table-toolbar';
import PoolPtcTableFiltersResult from '../pool-ptc-table-filters-result';
import PoolPtcTableRow from '../pool-ptc-table-row';
import PtcConversionTableRow from '../ptc-conversion-table-row';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  getComparator,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { useState, useCallback, useMemo } from 'react';
import PtcConversionListView from './ptc-conversion-list-view';

const POOL_TABLE_HEAD = [
  { id: 'name', label: 'Pool' },
  { id: 'status', label: 'Status' },
  { id: 'poolValue', label: 'Pool Value' },
  { id: 'ptcsIssued', label: 'PTCs Issued' },
  { id: 'merchants', label: 'Merchants' },
  { id: '', label: 'Action', width: 88 },
];

const PTC_TABLE_HEAD = [
  { id: 'series', label: 'Series' },
  { id: 'amount', label: 'Amount' },
  { id: 'maturity', label: 'Maturity' },
  { id: 'investors', label: 'Investors' },
  { id: 'status', label: 'Status' },
  { id: 'yieldValue', label: 'Yield' },
];

const defaultFilters = {
  name: '',
};

export default function PoolPtcListView({ pools = [], conversions = [], onViewRow }) {
  const poolTable = useTable({ defaultOrderBy: 'name' });
  const ptcTable = useTable({ defaultOrderBy: 'series' });
  const [poolFilters, setPoolFilters] = useState(defaultFilters);
  const [ptcFilters, setPtcFilters] = useState(defaultFilters);

  const poolsFiltered = useMemo(
    () =>
      applyPoolFilter({
        inputData: pools,
        comparator: getComparator(poolTable.order, poolTable.orderBy),
        filters: poolFilters,
      }),
    [poolFilters, pools, poolTable.order, poolTable.orderBy]
  );

  const conversionsFiltered = useMemo(
    () =>
      applyPtcFilter({
        inputData: conversions,
        comparator: getComparator(ptcTable.order, ptcTable.orderBy),
        filters: ptcFilters,
      }),
    [conversions, ptcFilters, ptcTable.order, ptcTable.orderBy]
  );

  const handlePoolFilters = useCallback(
    (name, value) => {
      poolTable.onResetPage();
      setPoolFilters((prevState) => ({ ...prevState, [name]: value }));
    },
    [poolTable]
  );

  const handlePtcFilters = useCallback(
    (name, value) => {
      ptcTable.onResetPage();
      setPtcFilters((prevState) => ({ ...prevState, [name]: value }));
    },
    [ptcTable]
  );

  const handleResetPoolFilters = useCallback(() => {
    setPoolFilters(defaultFilters);
  }, []);

  const handleResetPtcFilters = useCallback(() => {
    setPtcFilters(defaultFilters);
  }, []);

  return (
    <>
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography variant="h6">Associated Pools</Typography>
        </Box>

        <Divider />

        <PoolPtcTableToolbar filters={poolFilters} onFilters={handlePoolFilters} />

        {!!poolFilters.name && (
          <PoolPtcTableFiltersResult
            filters={poolFilters}
            onFilters={handlePoolFilters}
            onResetFilters={handleResetPoolFilters}
            results={poolsFiltered.length}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={poolTable.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={poolTable.order}
                orderBy={poolTable.orderBy}
                headLabel={POOL_TABLE_HEAD}
                rowCount={poolsFiltered.length}
                numSelected={0}
                onSort={poolTable.onSort}
              />

              <TableBody>
                {poolsFiltered
                  .slice(poolTable.page * poolTable.rowsPerPage, poolTable.page * poolTable.rowsPerPage + poolTable.rowsPerPage)
                  .map((row) => (
                    <PoolPtcTableRow key={row.id} row={row} onViewRow={onViewRow} />
                  ))}

                <TableNoData notFound={!poolsFiltered.length} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={poolsFiltered.length}
          page={poolTable.page}
          rowsPerPage={poolTable.rowsPerPage}
          onPageChange={poolTable.onChangePage}
          onRowsPerPageChange={poolTable.onChangeRowsPerPage}
          dense={poolTable.dense}
          onChangeDense={poolTable.onChangeDense}
        />
      </Card>

      <PtcConversionListView conversions={conversions}/>
    </>
  );
}

PoolPtcListView.propTypes = {
  conversions: PropTypes.array,
  onViewRow: PropTypes.func,
  pools: PropTypes.array,
};

function applyPoolFilter({ inputData, comparator, filters }) {
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
        String(item.name || '').toLowerCase().includes(searchValue) ||
        String(item.subtitle || '').toLowerCase().includes(searchValue) ||
        String(item.status || '').toLowerCase().includes(searchValue)
    );
  }

  return filteredData;
}

function applyPtcFilter({ inputData, comparator, filters }) {
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
        String(item.series || '').toLowerCase().includes(searchValue) ||
        String(item.issuedOn || '').toLowerCase().includes(searchValue) ||
        String(item.status || '').toLowerCase().includes(searchValue)
    );
  }

  return filteredData;
}
