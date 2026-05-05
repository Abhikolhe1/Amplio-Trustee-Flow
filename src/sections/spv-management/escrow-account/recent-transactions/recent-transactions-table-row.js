import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
// components
import Label from 'src/components/label';

export default function RecentTransactionsTableRow({ row }) {
  const { id, counterparty, amount, date, time, utr, type } = row;

  return (
    <TableRow hover>
      <TableCell sx={{ fontWeight: 700 }}>{id}</TableCell>

      <TableCell>
        <ListItemText
          primary={counterparty}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
        />
      </TableCell>

      <TableCell>
        {amount}
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={String(type || '').toLowerCase() === 'inflow' ? 'success' : 'error'}
        >
          {type}
        </Label>
      </TableCell>

      <TableCell>
        <ListItemText
          primary={date}
          secondary={time}
          primaryTypographyProps={{ variant: 'body2', noWrap: true }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {utr}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

RecentTransactionsTableRow.propTypes = {
  row: PropTypes.object,
};
