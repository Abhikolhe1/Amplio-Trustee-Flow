import PropTypes from 'prop-types';
import { format } from 'date-fns';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
// components
import Label from 'src/components/label';
import { IconButton, Tooltip } from '@mui/material';
import Iconify from 'src/components/iconify';

const STATUS_COLOR = {
  active: 'success',
  pending: 'warning',
  draft: 'info',
  closed: 'default',
};

export default function SpvManagementTableRow({ row, onViewRow }) {
  const statusColor = STATUS_COLOR[String(row.status || '').toLowerCase()] || 'default';

  return (
    <TableRow hover>
      <TableCell>
        <ListItemText
          primary={row.name}
          secondary={row.issuer}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            typography: 'caption',
            sx: { color: 'text.secondary' },
          }}
        />
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Label variant="soft" color={statusColor}>
          {row.status}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.activePTC}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>INR {row.outstandingValue} Cr</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.coupon}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {format(new Date(row.maturityDate), 'dd MMM yyyy')}
      </TableCell>
      <TableCell >
        <Tooltip title="Details" placement="top" arrow>
          <IconButton onClick={onViewRow}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
        </Tooltip>

        {/* <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton> */}
      </TableCell>
    </TableRow>
  );
}

SpvManagementTableRow.propTypes = {
  row: PropTypes.object,
  onViewRow: PropTypes.func
};
