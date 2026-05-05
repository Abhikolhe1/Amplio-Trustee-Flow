import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Label from 'src/components/label';

const STATUS_COLOR = {
  active: 'success',
  pending: 'warning',
  closed: 'default',
};

export default function PtcConversionTableRow({ row }) {
  const { series, issuedOn, amount, maturity, investors, status, yieldValue } = row;

  return (
    <TableRow hover>
      <TableCell>
        <ListItemText
          primary={series}
          secondary={`Issued: ${issuedOn}`}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </TableCell>

      <TableCell>
          {amount}
      </TableCell>

      <TableCell>
          {maturity}
      </TableCell>

      <TableCell>
          {investors}
      </TableCell>

      <TableCell>
        <Label variant="soft" color={STATUS_COLOR[String(status || '').toLowerCase()] || 'default'}>
          {status}
        </Label>
      </TableCell>

      <TableCell>
        {yieldValue}
      </TableCell>
    </TableRow>
  );
}

PtcConversionTableRow.propTypes = {
  row: PropTypes.object,
};
