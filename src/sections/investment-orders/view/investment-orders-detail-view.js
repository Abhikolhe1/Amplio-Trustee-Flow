import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
// routes
import { useParams, useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// api
import { useGetInvestmentOrderById, useGetRedemptionOrderById, updateInvestmentOrderStatus } from 'src/api/investment-orders';

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUS_META = {
  CREATED: { label: 'Created', color: 'default', icon: 'eva:plus-circle-fill' },
  AGREEMENT_SIGNED: { label: 'Agreement Signed', color: 'info', icon: 'eva:edit-2-fill' },
  PAYMENT_PENDING: { label: 'Payment Pending', color: 'warning', icon: 'eva:clock-fill' },
  UTR_SUBMITTED: { label: 'UTR Submitted', color: 'info', icon: 'eva:upload-fill' },
  PAYMENT_UNDER_REVIEW: { label: 'Under Review', color: 'warning', icon: 'eva:eye-fill' },
  PAYMENT_SUCCESS: {
    label: 'Payment Verified',
    color: 'success',
    icon: 'eva:checkmark-circle-2-fill',
  },
  PAYMENT_FAILED: { label: 'Payment Failed', color: 'error', icon: 'eva:close-circle-fill' },
  PAYMENT_TIMEOUT: { label: 'Timed Out', color: 'error', icon: 'eva:clock-outline' },
  PTC_FREEZE_EXPIRED: { label: 'Reservation Expired', color: 'error', icon: 'eva:clock-outline' },
  CANCELLED: { label: 'Cancelled', color: 'default', icon: 'eva:slash-fill' },
};

const ACTIVE_STATUSES = [
  'CREATED',
  'AGREEMENT_SIGNED',
  'PAYMENT_PENDING',
  'UTR_SUBMITTED',
  'PAYMENT_UNDER_REVIEW',
];
const TERMINAL_FAILED = ['PAYMENT_FAILED', 'PAYMENT_TIMEOUT', 'PTC_FREEZE_EXPIRED'];
const TERMINAL_SUCCESS = ['PAYMENT_SUCCESS'];
const REVIEWABLE_STATUSES = ['UTR_SUBMITTED', 'PAYMENT_UNDER_REVIEW'];

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

// ── Timeline steps ─────────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  {
    id: 'order_created',
    label: 'Order Created',
    description: 'Investment order initiated in the system.',
    icon: 'eva:plus-circle-fill',
    reached: () => true,
    failed: () => false,
    timestamp: (o) => o.createdAt,
  },
  {
    id: 'agreement_signed',
    label: 'Agreement Signed',
    description: 'Investment agreement signed. Payment instructions issued.',
    icon: 'eva:edit-2-fill',
    reached: (o) =>
      [
        'AGREEMENT_SIGNED',
        'PAYMENT_PENDING',
        'UTR_SUBMITTED',
        'PAYMENT_UNDER_REVIEW',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'PAYMENT_TIMEOUT',
        'PTC_FREEZE_EXPIRED',
        'CANCELLED',
      ].includes(o.status),
    failed: () => false,
    timestamp: (o) => o.agreementSignedAt ?? o.createdAt,
  },
  {
    id: 'payment_instructions',
    label: 'Payment Instructions Issued',
    description: 'Escrow bank details shared. Transfer within the payment window.',
    icon: 'eva:credit-card-fill',
    reached: (o) =>
      [
        'PAYMENT_PENDING',
        'UTR_SUBMITTED',
        'PAYMENT_UNDER_REVIEW',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'PAYMENT_TIMEOUT',
        'PTC_FREEZE_EXPIRED',
      ].includes(o.status),
    failed: () => false,
    timestamp: (o) => o.agreementSignedAt ?? o.createdAt,
  },
  {
    id: 'utr_submitted',
    label: 'UTR Submitted',
    description: 'Payment reference number submitted by investor for verification.',
    icon: 'eva:upload-fill',
    reached: (o) =>
      [
        'UTR_SUBMITTED',
        'PAYMENT_UNDER_REVIEW',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'PTC_FREEZE_EXPIRED',
      ].includes(o.status),
    failed: (o) => o.status === 'PAYMENT_TIMEOUT',
    timestamp: (o) => o.utrSubmittedAt,
  },
  {
    id: 'payment_verified',
    label: 'Payment Verified',
    description: 'Bank transfer matched against UTR. Payment confirmed by trustee.',
    icon: 'eva:checkmark-circle-2-fill',
    reached: (o) => o.status === 'PAYMENT_SUCCESS',
    failed: (o) => TERMINAL_FAILED.includes(o.status),
    timestamp: (o) => o.resolvedAt,
  },
  {
    id: 'units_allocated',
    label: 'PTC Units Allocated',
    description: 'Units allocated to investor portfolio. Investment active.',
    icon: 'eva:award-fill',
    reached: (o) => o.status === 'PAYMENT_SUCCESS' && o.allocatedUnits != null,
    failed: () => false,
    timestamp: (o) => o.allocatedAt,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTs(value) {
  if (!value) return null;
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── InfoRow ────────────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.1 }}>
      <Typography fontSize={13} color="text.secondary" sx={{ flexShrink: 0, mr: 2 }}>
        {label}
      </Typography>
      <Typography
        fontSize={13}
        fontWeight={600}
        textAlign="right"
        sx={{ fontFamily: mono ? 'monospace' : undefined, wordBreak: 'break-all' }}
      >
        {value ?? '—'}
      </Typography>
    </Stack>
  );
}
InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
  mono: PropTypes.bool,
};

// ── Timeline ───────────────────────────────────────────────────────────────────

function TimelineStep({ step, state, timestamp, isLast }) {
  let iconColor = 'action.disabled';
  if (state === 'done') iconColor = 'success.main';
  else if (state === 'failed' || state === 'cancelled') iconColor = 'error.main';

  let iconBg = 'action.disabledBackground';
  if (state === 'done') iconBg = 'success.lighter';
  else if (state === 'failed' || state === 'cancelled') iconBg = 'error.lighter';

  const lineColor = state === 'done' ? 'success.lighter' : 'action.disabledBackground';

  let textColor = 'text.disabled';
  if (state === 'done') textColor = 'text.primary';
  else if (state === 'failed' || state === 'cancelled') textColor = 'error.main';

  return (
    <Stack direction="row" spacing={1.5}>
      <Stack alignItems="center" sx={{ width: 32, flexShrink: 0 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: iconBg,
            flexShrink: 0,
          }}
        >
          <Iconify icon={step.icon} width={16} sx={{ color: iconColor }} />
        </Box>
        {!isLast && (
          <Box
            sx={{
              width: 2,
              flex: 1,
              minHeight: 24,
              bgcolor: lineColor,
              my: 0.5,
              borderRadius: 1,
            }}
          />
        )}
      </Stack>

      <Stack spacing={0.25} sx={{ pb: isLast ? 0 : 2.5, pt: 0.5, flex: 1 }}>
        <Typography fontSize={13} fontWeight={700} color={textColor}>
          {step.label}
        </Typography>
        <Typography fontSize={12} color="text.secondary" lineHeight={1.5}>
          {step.description}
        </Typography>
        {timestamp && state !== 'pending' && (
          <Typography fontSize={11} color="text.disabled" sx={{ mt: 0.25 }}>
            {formatTs(timestamp)}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
TimelineStep.propTypes = {
  step: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.string,
  }).isRequired,
  state: PropTypes.oneOf(['done', 'failed', 'cancelled', 'pending']).isRequired,
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  isLast: PropTypes.bool,
};

function OrderTimeline({ order }) {
  const isCancelled = order.status === 'CANCELLED';

  return (
    <Stack spacing={0}>
      {TIMELINE_STEPS.map((step, index) => {
        const done = step.reached(order);
        const stepFailed = step.failed(order);
        const ts = step.timestamp(order);
        const isLast = index === TIMELINE_STEPS.length - 1 && !isCancelled;

        let state = 'pending';
        if (stepFailed) state = 'failed';
        else if (done) state = 'done';

        return (
          <TimelineStep
            key={step.id}
            step={step}
            state={state}
            timestamp={ts}
            isLast={isLast && !isCancelled}
          />
        );
      })}

      {isCancelled && (
        <TimelineStep
          step={{
            id: 'cancelled',
            label: 'Order Cancelled',
            description: order.cancellationReason || 'Cancelled by investor.',
            icon: 'eva:slash-fill',
          }}
          state="cancelled"
          timestamp={order.resolvedAt}
          isLast
        />
      )}
    </Stack>
  );
}
OrderTimeline.propTypes = {
  order: PropTypes.shape({
    status: PropTypes.string,
    cancellationReason: PropTypes.string,
    resolvedAt: PropTypes.string,
  }).isRequired,
};

// ── Verify Payment ─────────────────────────────────────────────────────────────

function VerifyPaymentSection({ orderId, onDone }) {
  const [open, setOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    try {
      setVerifying(true);
      await updateInvestmentOrderStatus(orderId, { status: 'PAYMENT_SUCCESS' });
      enqueueSnackbar('Payment verified successfully.', { variant: 'success' });
      setOpen(false);
      onDone?.();
    } catch (err) {
      enqueueSnackbar(err?.message || 'Failed to verify payment.', { variant: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  if (!open) {
    return (
      <Button
        fullWidth
        variant="contained"
        color="success"
        startIcon={<Iconify icon="eva:checkmark-circle-2-fill" width={17} />}
        onClick={() => setOpen(true)}
        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1 }}
      >
        Verify Payment
      </Button>
    );
  }

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'success.light',
        bgcolor: 'success.lighter',
      }}
    >
      <Stack spacing={2}>
        <Typography fontSize={13} fontWeight={700} color="success.darker">
          Confirm Payment Verification
        </Typography>
        <Typography fontSize={13} color="success.dark">
          This will mark the payment as verified and allocate PTC units to the investor. Are you
          sure?
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            color="success"
            onClick={() => setOpen(false)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="success"
            disabled={verifying}
            onClick={handleVerify}
            startIcon={verifying ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1 }}
          >
            {verifying ? 'Verifying…' : 'Confirm Verify'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
VerifyPaymentSection.propTypes = {
  orderId: PropTypes.string.isRequired,
  onDone: PropTypes.func,
};

// ── Reject Payment ─────────────────────────────────────────────────────────────

function RejectPaymentSection({ orderId, onDone }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) {
      enqueueSnackbar('Please enter a rejection reason.', { variant: 'error' });
      return;
    }
    try {
      setRejecting(true);
      await updateInvestmentOrderStatus(orderId, {
        status: 'PAYMENT_FAILED',
        reason: reason.trim(),
      });
      enqueueSnackbar('Payment marked as failed.', { variant: 'success' });
      setOpen(false);
      setReason('');
      onDone?.();
    } catch (err) {
      enqueueSnackbar(err?.message || 'Failed to reject payment.', { variant: 'error' });
    } finally {
      setRejecting(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <Button
        fullWidth
        variant="outlined"
        color="error"
        startIcon={<Iconify icon="eva:close-circle-fill" width={17} />}
        onClick={() => setOpen((v) => !v)}
        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1 }}
      >
        {open ? 'Cancel' : 'Reject Payment'}
      </Button>

      <Collapse in={open}>
        <Card
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
          }}
        >
          <Stack spacing={2}>
            <Typography fontSize={13} fontWeight={700} color="error.darker">
              Payment Rejection
            </Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Rejection Reason"
              placeholder="e.g. UTR mismatch, incorrect amount, duplicate transaction"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              inputProps={{ maxLength: 500 }}
            />
            <Button
              fullWidth
              variant="contained"
              color="error"
              disabled={rejecting || !reason.trim()}
              onClick={handleReject}
              startIcon={rejecting ? <CircularProgress size={14} color="inherit" /> : null}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1 }}
            >
              {rejecting ? 'Rejecting…' : 'Confirm Rejection'}
            </Button>
          </Stack>
        </Card>
      </Collapse>
    </Stack>
  );
}
RejectPaymentSection.propTypes = {
  orderId: PropTypes.string.isRequired,
  onDone: PropTypes.func,
};

// ── Sell order detail (redemption payout) ──────────────────────────────────────

const INR_SELL = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
function fmtDateSell(v) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const SELL_STATUS_META = {
  REQUESTED: { label: 'Requested', color: '#637381' },
  PENDING_SETTLEMENT: { label: 'Pending Settlement', color: '#B76E00' },
  READY_FOR_PAYOUT: { label: 'Ready for Payout', color: '#006C9C' },
  PAYOUT_PROCESSING: { label: 'Processing', color: '#B76E00' },
  PAID: { label: 'Paid', color: '#118D57' },
  RECONCILED: { label: 'Reconciled', color: '#118D57' },
  FAILED: { label: 'Failed', color: '#B71D18' },
  CANCELLED: { label: 'Cancelled', color: '#637381' },
  RETRY_PENDING: { label: 'Retry Pending', color: '#B76E00' },
};

function SellOrderDetailView() {
  const router = useRouter();
  const { orderId } = useParams();
  const payoutId = orderId.replace(/^sell-/, '');

  const { order: payout, orderLoading, orderError } = useGetRedemptionOrderById(payoutId);

  if (orderLoading) {
    return (
      <Container sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (orderError || !payout) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => router.push(paths.dashboard.investmentOrders.root)}>
              Back to Orders
            </Button>
          }
        >
          Redemption order not found or you do not have permission to view it.
        </Alert>
      </Container>
    );
  }

  const meta = SELL_STATUS_META[payout.status] ?? { label: payout.status, color: '#637381' };
  const payoutIdShort = payout.id ? `#${payout.id.slice(0, 8).toUpperCase()}` : '—';

  return (
    <Container maxWidth="lg" sx={{ pb: 8 }}>
      <CustomBreadcrumbs
        heading={`Sell Order ${payoutIdShort}`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Investor Orders', href: paths.dashboard.investmentOrders.root },
          { name: payoutIdShort },
        ]}
        sx={{ mb: 3 }}
      />

      {/* Status banner */}
      <Card sx={{ p: 3, mb: 3, bgcolor: ['PAID', 'RECONCILED'].includes(payout.status) ? 'success.lighter' : ['FAILED', 'CANCELLED'].includes(payout.status) ? 'error.lighter' : 'background.paper' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Chip label="Sell / Redemption" size="small" color="error" variant="soft" />
          <Chip label={meta.label} size="small" sx={{ bgcolor: `${meta.color}22`, color: meta.color, fontWeight: 700 }} />
        </Stack>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 360px' }, gap: 3 }}>
        {/* Left column */}
        <Stack spacing={3}>
          {/* Investor */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Investor Details</Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Name</Typography>
                <Typography variant="body2" fontWeight={600}>{payout.investorName || '—'}</Typography>
              </Stack>
              {payout.investorEmail && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body2">{payout.investorEmail}</Typography>
                </Stack>
              )}
            </Stack>
          </Card>

          {/* Payout breakdown */}
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Payout Breakdown</Typography>
            <Stack spacing={1.5}>
              {[
                ['Net Payout', payout.netPayout],
                ['Gross Payout', payout.grossPayout],
                ['Principal', payout.principalPayout],
                ['Interest', payout.interestPayout],
                ['Capital Gain', payout.capitalGain],
                ['Stamp Duty', payout.stampDutyAmount],
              ].map(([label, val]) => val != null && (
                <Stack key={label} direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={label === 'Net Payout' ? 700 : 400}>
                    {INR_SELL.format(Number(val))}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Stack>

        {/* Right column */}
        <Stack spacing={3}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Order Summary</Typography>
            <Stack spacing={1.5}>
              {[
                ['Units Redeemed', payout.units],
                ['SPV', payout.spvId ? payout.spvId.slice(0, 8).toUpperCase() + '…' : '—'],
                ['Submitted', fmtDateSell(payout.submittedAt ?? payout.createdAt)],
                ['Expected Payout', fmtDateSell(payout.expectedPayoutDate)],
                ['Settlement Date', fmtDateSell(payout.settlementDate)],
                ['Annual Rate', payout.annualInterestRate ? `${payout.annualInterestRate}%` : null],
              ].map(([label, val]) => val != null && (
                <Stack key={label} direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{val}</Typography>
                </Stack>
              ))}
            </Stack>
          </Card>

          {payout.failureReason && (
            <Alert severity="error">
              <Typography variant="subtitle2">Failure Reason</Typography>
              <Typography variant="body2">{payout.failureReason}</Typography>
            </Alert>
          )}
        </Stack>
      </Box>
    </Container>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function InvestmentOrdersDetailView() {
  const { orderId } = useParams();
  if (orderId?.startsWith('sell-')) return <SellOrderDetailView />;
  return <BuyOrderDetailView />;
}

function BuyOrderDetailView() {
  const router = useRouter();
  const { orderId } = useParams();

  const { order, orderLoading, orderError, refreshOrder } = useGetInvestmentOrderById(orderId);

  const handleAfterAction = useCallback(() => {
    refreshOrder();
  }, [refreshOrder]);

  if (orderLoading) {
    return (
      <Container sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (orderError || !order) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              onClick={() => router.push(paths.dashboard.investmentOrders.root)}
            >
              Back to Orders
            </Button>
          }
        >
          Order not found or you do not have permission to view it.
        </Alert>
      </Container>
    );
  }

  const statusMeta = STATUS_META[order.status] ?? {
    label: order.status,
    color: 'default',
    icon: 'eva:question-mark-circle-fill',
  };

  const isActive = ACTIVE_STATUSES.includes(order.status);
  const isFailed = TERMINAL_FAILED.includes(order.status);
  const isSuccess = TERMINAL_SUCCESS.includes(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isReviewable = REVIEWABLE_STATUSES.includes(order.status);

  const spvShort = order.spvId ? order.spvId.slice(0, 8).toUpperCase() : '—';
  const orderShort = order.id ? `#${order.id.slice(0, 8).toUpperCase()}` : '—';
  const investorShort = order.investorProfileId
    ? order.investorProfileId.slice(0, 8).toUpperCase()
    : '—';

  let bannerBg = 'background.paper';
  if (isFailed) bannerBg = 'error.lighter';
  else if (isSuccess) bannerBg = 'success.lighter';
  else if (isCancelled) bannerBg = 'background.neutral';

  return (
    <Container maxWidth="lg" sx={{ pb: 8 }}>
      <CustomBreadcrumbs
        heading={`Order ${orderShort}`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Investor Orders', href: paths.dashboard.investmentOrders.root },
          { name: orderShort },
        ]}
        sx={{ mb: 3 }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 380px' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* ── LEFT COLUMN ── */}
        <Stack spacing={3}>
          {/* Status banner */}
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1.5px solid',
              borderColor: `${statusMeta.color}.light`,
              bgcolor: bannerBg,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
            >
              <Stack spacing={0.75}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify
                    icon={statusMeta.icon}
                    width={22}
                    sx={{ color: `${statusMeta.color}.main` }}
                  />
                  <Typography variant="h6" fontWeight={700}>
                    {statusMeta.label}
                  </Typography>
                </Stack>
                <Typography fontSize={13} color="text.secondary">
                  Order {orderShort} · SPV {spvShort}…
                </Typography>
                {order.cancellationReason && (
                  <Typography fontSize={13} color="error.dark" fontWeight={500}>
                    Reason: {order.cancellationReason}
                  </Typography>
                )}
              </Stack>
              <Chip
                label={statusMeta.label}
                color={statusMeta.color}
                icon={<Iconify icon={statusMeta.icon} width={14} />}
                sx={{ fontWeight: 700, px: 1 }}
              />
            </Stack>

            {isActive && order.paymentDeadlineAt && (
              <Alert
                severity="warning"
                variant="outlined"
                sx={{ mt: 2 }}
                icon={<Iconify icon="eva:clock-fill" width={18} />}
              >
                Payment deadline: <strong>{formatTs(order.paymentDeadlineAt)}</strong>
              </Alert>
            )}
            {order.status === 'PAYMENT_TIMEOUT' && (
              <Alert severity="error" variant="outlined" sx={{ mt: 2 }}>
                The 48-hour payment window elapsed without a confirmed transfer. PTC units have been
                released.
              </Alert>
            )}
            {order.status === 'PTC_FREEZE_EXPIRED' && (
              <Alert severity="error" variant="outlined" sx={{ mt: 2 }}>
                The 30-minute unit reservation expired before payment could be verified. The held
                units have been released.
              </Alert>
            )}
            {order.status === 'PAYMENT_FAILED' && (
              <Alert severity="error" variant="outlined" sx={{ mt: 2 }}>
                Payment verification failed.
                {order.rejectionReason ? ` Reason: ${order.rejectionReason}` : ''}
              </Alert>
            )}
          </Card>

          {/* Order Timeline */}
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
              Order Timeline
            </Typography>
            <OrderTimeline order={order} />
          </Card>

          {/* Payment Verification Details — trustee has full visibility */}
          {(order.utrNumber || order.utrSubmittedAt || order.verificationStatus || order.verificationId) && (
            <Card sx={{ p: 3, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Iconify icon="eva:shield-fill" width={18} sx={{ color: 'info.main' }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Payment Verification Details
                </Typography>
              </Stack>

              {order.utrNumber && (
                <>
                  <InfoRow label="UTR Number" value={order.utrNumber} mono />
                  <Divider />
                </>
              )}
              {order.utrSubmittedAt && (
                <>
                  <InfoRow label="UTR Submitted At" value={formatTs(order.utrSubmittedAt)} />
                  <Divider />
                </>
              )}
              {order.verificationStatus && (
                <>
                  <InfoRow label="Verification Status" value={order.verificationStatus} />
                  <Divider />
                </>
              )}
              {order.verificationId && (
                <InfoRow label="Verification ID" value={order.verificationId} mono />
              )}
            </Card>
          )}
        </Stack>

        {/* ── RIGHT COLUMN ── */}
        <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
          {/* Investor Details — trustee exclusive */}
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Iconify icon="eva:person-fill" width={18} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight={700}>
                Investor Details
              </Typography>
            </Stack>
            <InfoRow label="Name" value={order.investorName || `INV-${investorShort}`} />
            {order.investorEmail && (
              <>
                <Divider />
                <InfoRow label="Email" value={order.investorEmail} />
              </>
            )}
          </Card>

          {/* Investment Summary */}
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Investment Summary
            </Typography>

            <InfoRow label="Order ID" value={order.id} mono />
            <Divider />
            <InfoRow label="SPV ID" value={order.spvId} mono />
            <Divider />
            <InfoRow label="Amount" value={INR.format(Number(order.investmentAmount ?? 0))} />
            <Divider />
            <InfoRow label="Units Requested" value={order.requestedUnits} />
            {order.allocatedUnits != null && (
              <>
                <Divider />
                <InfoRow
                  label="Units Allocated"
                  value={
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <span>{order.allocatedUnits}</span>
                      {order.partialAllocation && (
                        <Chip
                          label="Partial"
                          size="small"
                          color="warning"
                          sx={{ height: 16, fontSize: 10 }}
                        />
                      )}
                    </Stack>
                  }
                />
              </>
            )}
            {order.faceValuePerUnit && (
              <>
                <Divider />
                <InfoRow
                  label="Face Value / Unit"
                  value={INR.format(Number(order.faceValuePerUnit))}
                />
              </>
            )}
            <Divider />
            <InfoRow label="Created" value={formatTs(order.createdAt)} />
            {order.resolvedAt && (
              <>
                <Divider />
                <InfoRow label="Resolved At" value={formatTs(order.resolvedAt)} />
              </>
            )}
            {order.allocatedAt && (
              <>
                <Divider />
                <InfoRow label="Allocated At" value={formatTs(order.allocatedAt)} />
              </>
            )}
            {order.allocationDate && (
              <>
                <Divider />
                <InfoRow
                  label="Allocation Date"
                  value={new Date(order.allocationDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                />
              </>
            )}
          </Card>

          {/* Trustee Actions */}
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Iconify icon="eva:settings-2-fill" width={18} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight={700}>
                Trustee Actions
              </Typography>
            </Stack>

            <Stack spacing={1.5}>
              {isReviewable && (
                <>
                  <VerifyPaymentSection orderId={order.id} onDone={handleAfterAction} />
                  <RejectPaymentSection orderId={order.id} onDone={handleAfterAction} />
                </>
              )}

              {!isReviewable && !isSuccess && !isFailed && !isCancelled && (
                <Alert severity="info" sx={{ fontSize: 12 }}>
                  No admin actions available for the current order status.
                </Alert>
              )}

              {isSuccess && (
                <Alert severity="success" sx={{ fontSize: 12 }}>
                  Payment verified. Units allocated to investor portfolio.
                </Alert>
              )}

              {(isFailed || isCancelled) && (
                <Alert severity="error" sx={{ fontSize: 12 }}>
                  Order is in a terminal state. No further actions available.
                </Alert>
              )}

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Iconify icon="eva:arrow-back-fill" width={17} />}
                onClick={() => router.push(paths.dashboard.investmentOrders.root)}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1 }}
              >
                Back to Orders
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
}
