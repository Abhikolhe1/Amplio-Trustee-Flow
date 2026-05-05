import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Label from 'src/components/label';
import Stack from '@mui/material/Stack';
import { format } from 'date-fns';

const STATUS_COLOR = {
  success: 'success',
  failed: 'error',
  processing: 'info',
  pending: 'warning',
};

export default function PoolTransactionFlowTableRow({ row }) {
  const { id, path, amount, date, time, utr, status, note } = row;

  return (
    <TableRow hover>
      <TableCell>
        <ListItemText
          primary={id}
          secondary={path}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </TableCell>

      <TableCell> {amount}</TableCell>

      <TableCell>
        <ListItemText
            primary={format(new Date(date), 'dd MMM yyyy')}
            secondary={format(new Date(date), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
      </TableCell>

      <TableCell>
        <Typography variant="body2">{utr}</Typography>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={STATUS_COLOR[String(status || '').toLowerCase()] || 'default'}>
          {status}
        </Label>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: note ? 'text.primary' : 'text.secondary' }}>
          {note || '-'}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

PoolTransactionFlowTableRow.propTypes = {
  row: PropTypes.object,
};
