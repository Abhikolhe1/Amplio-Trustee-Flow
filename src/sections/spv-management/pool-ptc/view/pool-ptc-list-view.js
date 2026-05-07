import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import PoolPtcTableToolbar from '../pool-ptc-table-toolbar';
import PoolPtcTableFiltersResult from '../pool-ptc-table-filters-result';
import PoolPtcTableRow from '../pool-ptc-table-row';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import {
  useTable,
  getComparator,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { useState, useCallback, useMemo } from 'react';
import { getPendingPoolApplicationLabel } from '../../utils';
import PtcConversionListView from './ptc-conversion-list-view';

const POOL_TABLE_HEAD = [
  { id: 'name', label: 'Pool' },
  { id: 'status', label: 'Status' },
  { id: 'poolValue', label: 'Pool Value' },
  { id: 'ptcsIssued', label: 'PTCs Issued' },
  { id: 'merchants', label: 'Merchants' },
  { id: '', label: 'Action', width: 88 },
];

const defaultFilters = {
  name: '',
};

export default function PoolPtcListView({
  pools = [],
  canCreateNewPool,
  pendingPoolApplications,
  poolsLoading,
  poolsError,
  onCreatePool,
  isCreatingPool,
  conversions = [],
  onViewRow,
}) {
  const poolTable = useTable({ defaultOrderBy: 'name' });
  const [poolFilters, setPoolFilters] = useState(defaultFilters);

  const poolsFiltered = useMemo(
    () =>
      applyPoolFilter({
        inputData: pools,
        comparator: getComparator(poolTable.order, poolTable.orderBy),
        filters: poolFilters,
      }),
    [poolFilters, pools, poolTable.order, poolTable.orderBy]
  );

  const handlePoolFilters = useCallback(
    (name, value) => {
      poolTable.onResetPage();
      setPoolFilters((prevState) => ({ ...prevState, [name]: value }));
    },
    [poolTable]
  );

  const handleResetPoolFilters = useCallback(() => {
    setPoolFilters(defaultFilters);
  }, []);

  return (
    <>
      <Card sx={{ borderRadius: 3 }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="h6">Associated Pools</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {getPendingPoolApplicationLabel(pendingPoolApplications)}
            </Typography>
          </Box>

          <Tooltip
            title={
              canCreateNewPool
                ? 'Create a new pool application'
                : 'Backend has disabled new pool creation for this SPV'
            }
            placement="top"
            arrow
          >
            <span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={onCreatePool}
                disabled={!canCreateNewPool || isCreatingPool}
              >
                Create New Pool
              </Button>
            </span>
          </Tooltip>
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

        {poolsError && (
          <Box sx={{ px: 2.5, pb: 2.5 }}>
            <Alert severity="error">
              {getErrorMessage(poolsError, 'Unable to load pools for this SPV.')}
            </Alert>
          </Box>
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
                {poolsLoading
                  ? Array.from({ length: poolTable.rowsPerPage }).map((_, index) => (
                      <TableSkeleton key={index} />
                    ))
                  : poolsFiltered
                      .slice(
                        poolTable.page * poolTable.rowsPerPage,
                        poolTable.page * poolTable.rowsPerPage + poolTable.rowsPerPage
                      )
                      .map((row) => (
                        <PoolPtcTableRow key={row.id} row={row} onViewRow={onViewRow} />
                      ))}

                {!poolsLoading && <TableNoData notFound={!poolsFiltered.length} />}
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

      <PtcConversionListView conversions={conversions} />
    </>
  );
}

PoolPtcListView.propTypes = {
  canCreateNewPool: PropTypes.bool,
  conversions: PropTypes.array,
  isCreatingPool: PropTypes.bool,
  onCreatePool: PropTypes.func,
  onViewRow: PropTypes.func,
  pendingPoolApplications: PropTypes.number,
  poolsError: PropTypes.any,
  poolsLoading: PropTypes.bool,
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

function getErrorMessage(error, fallback = 'Something went wrong') {
  if (typeof error === 'string') {
    return error;
  }

  return error?.message || error?.error?.message || fallback;
}
