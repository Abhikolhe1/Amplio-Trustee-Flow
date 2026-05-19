import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { IconButton } from '@mui/material';

// ----------------------------------------------------------------------

const STATUS_META = {
  // Buy order statuses
  CREATED: { label: 'Created', color: 'default' },
  AGREEMENT_SIGNED: { label: 'Agreement Signed', color: 'info' },
  PAYMENT_PENDING: { label: 'Payment Pending', color: 'warning' },
  UTR_SUBMITTED: { label: 'UTR Submitted', color: 'info' },
  PAYMENT_UNDER_REVIEW: { label: 'Under Review', color: 'warning' },
  PAYMENT_SUCCESS: { label: 'Payment Verified', color: 'success' },
  PAYMENT_FAILED: { label: 'Payment Failed', color: 'error' },
  PAYMENT_TIMEOUT: { label: 'Timed Out', color: 'error' },
  PTC_FREEZE_EXPIRED: { label: 'Reservation Expired', color: 'error' },
  CANCELLED: { label: 'Cancelled', color: 'default' },
  // Sell (redemption) order statuses
  REQUESTED: { label: 'Requested', color: 'default' },
  PENDING_SETTLEMENT: { label: 'Pending Settlement', color: 'warning' },
  READY_FOR_PAYOUT: { label: 'Ready for Payout', color: 'info' },
  PAYOUT_PROCESSING: { label: 'Processing', color: 'warning' },
  PAID: { label: 'Paid', color: 'success' },
  RECONCILED: { label: 'Reconciled', color: 'success' },
  FAILED: { label: 'Failed', color: 'error' },
  RETRY_PENDING: { label: 'Retry Pending', color: 'warning' },
};

const BUY_ACTIVE_STATUSES = [
  'CREATED',
  'AGREEMENT_SIGNED',
  'PAYMENT_PENDING',
  'UTR_SUBMITTED',
  'PAYMENT_UNDER_REVIEW',
];
const SELL_ACTIVE_STATUSES = [
  'REQUESTED',
  'PENDING_SETTLEMENT',
  'READY_FOR_PAYOUT',
  'PAYOUT_PROCESSING',
  'RETRY_PENDING',
];

const BUY_FAILED_STATUSES = ['PAYMENT_FAILED', 'PAYMENT_TIMEOUT', 'PTC_FREEZE_EXPIRED'];
const SELL_FAILED_STATUSES = ['FAILED'];

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

function fmtDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtDateTime(value) {
  if (!value) return null;
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ----------------------------------------------------------------------

export default function InvestmentOrdersTableRow({ row, onViewRow }) {
  const isSell = row.orderType === 'SELL';

  const activeStatuses = isSell ? SELL_ACTIVE_STATUSES : BUY_ACTIVE_STATUSES;
  const failedStatuses = isSell ? SELL_FAILED_STATUSES : BUY_FAILED_STATUSES;
  const successStatuses = isSell ? ['PAID', 'RECONCILED'] : ['PAYMENT_SUCCESS'];

  const isActive = activeStatuses.includes(row.status);
  const isFailed = failedStatuses.includes(row.status);
  const isSuccess = successStatuses.includes(row.status);

  const statusMeta = STATUS_META[row.status] ?? { label: row.status, color: 'default' };

  let borderLeftColor = 'transparent';
  if (isActive) borderLeftColor = 'warning.main';
  else if (isSuccess) borderLeftColor = 'success.main';
  else if (isFailed) borderLeftColor = 'error.main';

  const spvShort = row.spvId ? row.spvId.slice(0, 8).toUpperCase() : '—';
  const orderShort = row.id ? `#${row.id.slice(0, 8).toUpperCase()}` : '—';
  const investorShort = row.investorProfileId
    ? row.investorProfileId.slice(0, 8).toUpperCase()
    : '—';

  // For sell orders: units is on `row.units`; for buy: allocatedUnits / requestedUnits
  const displayUnits = isSell ? row.units : (row.allocatedUnits ?? row.requestedUnits);
  const unitsLabel = isSell ? 'redeemed' : (row.allocatedUnits != null ? 'allocated' : 'requested');

  return (
    <TableRow
      hover
      onClick={onViewRow}
      sx={{ cursor: 'pointer', borderLeft: '3px solid', borderLeftColor }}
    >
      {/* Investor */}
      <TableCell>
        <Stack spacing={0.3}>
          <Typography variant="body2" fontWeight={600}>
            {row.investorName || `INV-${investorShort}`}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {row.investorEmail || `…${investorShort}`}
          </Typography>
        </Stack>
      </TableCell>

      {/* Order */}
      <TableCell>
        <Stack spacing={0.3}>
          <Typography variant="subtitle2" fontWeight={700} letterSpacing={0.3}>
            {orderShort}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {fmtDate(row.createdAt)}
          </Typography>
          {!isSell && row.utrSubmittedAt && (
            <Typography variant="caption" color="text.disabled">
              UTR: {fmtDateTime(row.utrSubmittedAt)}
            </Typography>
          )}
        </Stack>
      </TableCell>

      {/* SPV */}
      <TableCell>
        <Stack spacing={0.3}>
          <Typography variant="body2" fontWeight={600}>
            SPV {spvShort}…
          </Typography>
          {!isSell && row.paymentDeadlineAt && isActive && (
            <Tooltip title={`Payment deadline: ${fmtDateTime(row.paymentDeadlineAt)}`} arrow>
              <Typography variant="caption" color="warning.main" fontWeight={600}>
                Due {fmtDateTime(row.paymentDeadlineAt)}
              </Typography>
            </Tooltip>
          )}
          {isSell && row.expectedPayoutDate && (
            <Typography variant="caption" color="text.disabled">
              Payout: {fmtDate(row.expectedPayoutDate)}
            </Typography>
          )}
        </Stack>
      </TableCell>

      {/* Amount */}
      <TableCell align="right">
        <Typography variant="subtitle2" fontWeight={700}>
          {INR.format(Number(row.investmentAmount ?? 0))}
        </Typography>
      </TableCell>

      {/* Units */}
      <TableCell align="center">
        <Stack alignItems="center" spacing={0.3}>
          <Typography variant="subtitle2" fontWeight={600}>
            {displayUnits ?? '—'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {unitsLabel}
          </Typography>
          {!isSell && row.partialAllocation && (
            <Chip
              label="Partial"
              size="small"
              color="warning"
              sx={{ height: 16, fontSize: 10, fontWeight: 700 }}
            />
          )}
        </Stack>
      </TableCell>

      {/* Type */}
      <TableCell align="center">
        <Label color={isSell ? 'error' : 'primary'} variant="soft">
          {isSell ? 'Sell' : 'Buy'}
        </Label>
      </TableCell>

      {/* Status */}
      <TableCell align="center">
        <Label color={statusMeta.color} variant="soft">
          {statusMeta.label}
        </Label>
      </TableCell>

      {/* Actions */}
      <TableCell align="right">
        <Tooltip title="View" placement="top" arrow>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onViewRow();
            }}
          >
            <Iconify icon="solar:eye-bold" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

InvestmentOrdersTableRow.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.string,
    orderType: PropTypes.oneOf(['BUY', 'SELL']),
    investorProfileId: PropTypes.string,
    investorName: PropTypes.string,
    investorEmail: PropTypes.string,
    spvId: PropTypes.string,
    status: PropTypes.string,
    investmentAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    requestedUnits: PropTypes.number,
    allocatedUnits: PropTypes.number,
    units: PropTypes.number,
    partialAllocation: PropTypes.bool,
    paymentDeadlineAt: PropTypes.string,
    expectedPayoutDate: PropTypes.string,
    utrSubmittedAt: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onViewRow: PropTypes.func.isRequired,
};
