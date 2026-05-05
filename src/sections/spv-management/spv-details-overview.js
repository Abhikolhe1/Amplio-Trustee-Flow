import PropTypes from 'prop-types';
// @mui
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import SummaryCard from 'src/components/summary-card';

const STATUS_COLOR = {
  active: 'success',
  pending: 'warning',
  draft: 'info',
  closed: 'default',
};

export default function SPVDetailsOverviewView({ spvINR }) {
  const spv = spvINR || {};
  const financialSummary = spv.overviewFinancialSummaryINR || spv.overviewFinancialSummary || {};
  const statusColor = STATUS_COLOR[String(spv.status || '').toLowerCase()] || 'default';

  const infoRows = [
    { label: 'SPV Name', value: spv.name || '-' },
    { label: 'Registration Number', value: spv.registrationNumber || '-' },
    { label: 'Status', value: spv.status || '-', useLabel: Boolean(spv.status), color: statusColor },
    { label: 'Incorporated On', value: spv.incorporatedOn || '-' },
    { label: 'Monitoring Trustee', value: spv.monitoringTrustee || '-' },
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <SummaryCard title="SPV Information" data={infoRows} />
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, height: 1 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Financial Summary
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack
                spacing={1}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
                  Total FUM
                </Typography>
                <Typography variant="h4" sx={{ color: 'primary.main' }}>
                  INR {financialSummary.totalFum || '-'}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack
                spacing={1}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                  border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.16)}`,
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase' }}>
                  Active Deployment
                </Typography>
                <Typography variant="h4" sx={{ color: 'success.main' }}>
                  INR {financialSummary.activeDeployment || '-'}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack
                spacing={1}
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                  border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Reserve Fund
                </Typography>
                <Typography variant="h6">INR {financialSummary.reserveFund || '-'}</Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack
                spacing={1}
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                  border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Investors
                </Typography>
                <Typography variant="h6">{financialSummary.investors ?? '-'}</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
}

SPVDetailsOverviewView.propTypes = {
  spvINR: PropTypes.object,
};
