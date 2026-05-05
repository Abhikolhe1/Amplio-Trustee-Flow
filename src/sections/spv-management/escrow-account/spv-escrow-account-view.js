import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { SummaryDashboardGrid } from 'src/components/summary-card';
import  { RecentTransactionsListView } from './recent-transactions/view';

const STATUS_COLOR = {
  active: 'success',
  pending: 'warning',
  closed: 'default',
};

function DetailItem({ label, value, icon }) {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
        {icon ? <Iconify icon={icon} width={16} sx={{ color: 'text.disabled' }} /> : null}
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {value || '-'}
      </Typography>
    </Box>
  );
}

DetailItem.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.any,
};

export default function SpvEscrowAccountView({ escrow }) {
  if (!escrow) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          No escrow account details available.
        </Typography>
      </Card>
    );
  }

  const statusColor = STATUS_COLOR[String(escrow.status || '').toLowerCase()] || 'default';
  const escrowSummary = escrow.summary || [];
  const recentTransactions = escrow.recentTransactions || [];

  return (
    <>
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography variant="h6">SPV Escrow Account Details</Typography>
        </Box>

        <Divider />

        <Box sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:wallet-money-bold" width={22} />
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {escrow.bankName || '-'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {escrow.accountLabel || 'Escrow Account'}
                </Typography>
              </Box>
            </Stack>

            <Label color={statusColor}>{escrow.status || 'Unknown'}</Label>
          </Stack>

          <Box sx={{ ml: { md: 7 } }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <DetailItem label="Account Number" value={escrow.accountNumber} icon="solar:card-outline" />
              </Grid>
              <Grid item xs={12} md={6}>
                <DetailItem label="IFSC Code" value={escrow.ifscCode} icon="solar:document-text-outline" />
              </Grid>
              <Grid item xs={12} md={6}>
                <DetailItem label="Current Balance" value={`INR ${escrow.currentBalance || '-'}`} icon="solar:wallet-money-outline" />
              </Grid>
              <Grid item xs={12} md={6}>
                <DetailItem label="Branch" value={escrow.branch} icon="solar:buildings-outline" />
              </Grid>
              <Grid item xs={12} md={6}>
                <DetailItem label="Account Type" value={escrow.accountType} icon="solar:shield-outline" />
              </Grid>
              <Grid item xs={12} md={6}>
                <DetailItem label="Opened On" value={escrow.openedOn} icon="solar:calendar-outline" />
              </Grid>
            </Grid>

            <Box
              sx={{
                px: 2,
                py: 1.5,
                mb: 3,
                borderRadius: 1.5,
                color: 'primary.main',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography variant="body2">
                {escrow.note || 'This escrow account is mapped to the selected SPV.'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {escrowSummary.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {escrowSummary.map((item) => (
            <Grid item xs={12} md={4} key={item.label}>
              <SummaryDashboardGrid title={item.label} value={item.value} />
            </Grid>
          ))}
        </Grid>
      )}

      <RecentTransactionsListView transactions={recentTransactions} />
    </>
  );
}

SpvEscrowAccountView.propTypes = {
  escrow: PropTypes.object,
};
