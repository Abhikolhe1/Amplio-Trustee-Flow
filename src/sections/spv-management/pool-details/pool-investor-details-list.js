import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
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
import PoolInvestorTableRow from './pool-investor-table-row';


const TABLE_HEAD = [
  { id: 'investorName', label: 'Investor' },
  { id: 'purchasedOn', label: 'Purchased On' },
  { id: 'ptcInvestment', label: 'PTC Investment' },
  { id: 'interestDue', label: 'Interest Due' },
  { id: 'escrowAccount', label: 'Escrow Account' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'transferAmount', label: 'Transfer Amount' },
  { id: '', label: 'Action', width: 88 },
];

const defaultFilters = {
  name: '',
};

export default function PoolInvestorDetailsList({ investors = [], onViewRow }) {
  const table = useTable({ defaultOrderBy: 'investorName' });
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: investors,
        comparator: getComparator(table.order, table.orderBy),
        filters,
      }),
    [filters, investors, table.order, table.orderBy]
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
    <Card sx={{ borderRadius: 3 }}>
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="h6">PTC Holders & Investors</Typography>
      </Box>


      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1280 }}>
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
                  <PoolInvestorTableRow key={row.investorId} row={row} onViewRow={onViewRow} />
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
  );
}

PoolInvestorDetailsList.propTypes = {
  investors: PropTypes.array,
  onViewRow: PropTypes.func,
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
        String(item.investorName || '').toLowerCase().includes(searchValue) ||
        String(item.investorId || '').toLowerCase().includes(searchValue) ||
        String(item.escrowAccount || '').toLowerCase().includes(searchValue)
    );
  }

  return filteredData;
}
