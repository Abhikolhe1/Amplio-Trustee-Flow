import PropTypes from 'prop-types';
import { useState, useCallback, useMemo } from 'react';
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
import PtcConversionTableRow from '../ptc-conversion-table-row';

const TABLE_HEAD = [
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

export default function PtcConversionListView({ conversions = [] }) {
  const table = useTable({ defaultOrderBy: 'series' });
  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: conversions,
        comparator: getComparator(table.order, table.orderBy),
        filters,
      }),
    [conversions, filters, table.order, table.orderBy]
  );

  const canReset = !!filters.name;
  const notFound = !dataFiltered.length;

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

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <Card sx={{ mt: 3, borderRadius: 3 }}>
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="h6">PTC Conversion Summary</Typography>
      </Box>

      <Divider />
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
                  <PtcConversionTableRow key={row.series} row={row} />
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
  );
}

PtcConversionListView.propTypes = {
  conversions: PropTypes.array,
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
        String(item.series || '').toLowerCase().includes(searchValue) ||
        String(item.issuedOn || '').toLowerCase().includes(searchValue) ||
        String(item.status || '').toLowerCase().includes(searchValue)
    );
  }

  return filteredData;
}
