import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Label from 'src/components/label';

const STATUS_COLOR = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
};

export default function PoolMerchantTableRow({ row }) {
  const { merchantName, merchantId, receivables, gateway, status } = row;

  return (
    <TableRow hover>
      <TableCell>
        <ListItemText
          primary={merchantName}
          secondary={merchantId}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {receivables}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{gateway}</Typography>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={STATUS_COLOR[String(status || '').toLowerCase()] || 'default'}>
          {status}
        </Label>
      </TableCell>
    </TableRow>
  );
}

PoolMerchantTableRow.propTypes = {
  row: PropTypes.object,
};
