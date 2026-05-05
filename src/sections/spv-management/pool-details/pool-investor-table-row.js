import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Iconify from 'src/components/iconify';

export default function PoolInvestorTableRow({ row, onViewRow }) {
  const {
    investorId,
    investorName,
    purchasedOn,
    ptcInvestment,
    interestDue,
    escrowAccount,
    transactions,
    successfulTransfers,
    transferAmount,
  } = row;

  return (
    <TableRow hover>
      <TableCell>
        <ListItemText
          primary={investorName}
          secondary={investorId}
          primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      </TableCell>

      <TableCell>
        {purchasedOn}
      </TableCell>

      <TableCell>
    
          {ptcInvestment}
 
      </TableCell>

      <TableCell>
          {interestDue}
   
      </TableCell>

      <TableCell>
{escrowAccount}
      </TableCell>

      <TableCell>
        <Stack spacing={0.25}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {transactions}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {successfulTransfers}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
     
          {transferAmount}
      </TableCell>

      <TableCell align="right">
        <Tooltip title="View Profile" placement="top" arrow>
          <IconButton onClick={() => onViewRow?.(row)}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

PoolInvestorTableRow.propTypes = {
  onViewRow: PropTypes.func,
  row: PropTypes.object,
};
