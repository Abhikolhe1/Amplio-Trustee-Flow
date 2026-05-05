import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

const STATUS_COLOR = {
  active: 'success',
  pending: 'warning',
  closed: 'default',
};

export default function PoolPtcTableRow({ row, onViewRow }) {
  const { id, name, subtitle, poolValue, ptcsIssued, merchants, status } = row;

  return (
    <TableRow hover>
      <TableCell>
        <ListItemText
          primary={name}
          secondary={subtitle || id}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </TableCell>

      <TableCell>
        <Label variant="soft" color={STATUS_COLOR[String(status || '').toLowerCase()] || 'default'}>
          {status}
        </Label>
      </TableCell>

      <TableCell> {poolValue} </TableCell>

      <TableCell>  {ptcsIssued} </TableCell>

      <TableCell>  {merchants}</TableCell>

      <TableCell align="right">
        <Tooltip title="View" placement="top" arrow>
          <IconButton onClick={() => onViewRow?.(row)}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

PoolPtcTableRow.propTypes = {
  onViewRow: PropTypes.func,
  row: PropTypes.object,
};
