import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Label from 'src/components/label';
import { format } from 'date-fns';

const STATUS_COLOR = {
  settled: 'default',
  completed: 'success',
  matured: 'warning',
};

export default function ClosedTransactionsTableRow({ row }) {
  const { id, title, subtitle, amount, pool, closedOn, status } = row;

  return (
    <TableRow hover>
      <TableCell>
        <ListItemText
          primary={id}
          secondary={subtitle || title}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {amount}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {pool}
        </Typography>
      </TableCell>

      <TableCell>
         <ListItemText
            primary={format(new Date(closedOn), 'dd MMM yyyy')}
            secondary={format(new Date(closedOn), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
      </TableCell>

      <TableCell>
        <Label variant="soft" color={STATUS_COLOR[String(status || '').toLowerCase()] || 'default'}>
          {status}
        </Label>
      </TableCell>
    </TableRow>
  );
}

ClosedTransactionsTableRow.propTypes = {
  row: PropTypes.object,
};
