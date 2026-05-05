import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Label from 'src/components/label';
import { alpha } from '@mui/material/styles';

const STATUS_COLOR = {
  active: 'success',
  pending: 'warning',
  closed: 'default',
};

function InfoRow({ label, value, useLabel = false, color = 'default' }) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.75,
        borderRadius: 1.5,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.06),
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        {useLabel ? (
          <Label variant="soft" color={color}>
            {value}
          </Label>
        ) : (
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function FlowStep({ index, title, description }) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.75,
        borderRadius: 1.5,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.06),
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
            color: 'primary.main',
            typography: 'caption',
            fontWeight: 700,
          }}
        >
          {index}
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

InfoRow.propTypes = {
  color: PropTypes.string,
  label: PropTypes.string,
  useLabel: PropTypes.bool,
  value: PropTypes.any,
};

FlowStep.propTypes = {
  description: PropTypes.string,
  index: PropTypes.number,
  title: PropTypes.string,
};

export default function PoolOverviewTab({ pool }) {
  if (!pool) return null;

  const statusColor = STATUS_COLOR[String(pool.overview?.status || '').toLowerCase()] || 'default';
  const flowSteps = pool.transactionFlow?.steps || [];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: 1, borderRadius: 3 }}>
          <Box sx={{ px: 3, py: 2.5 }}>
            <Typography variant="h6">Pool Information</Typography>
          </Box>

          <Box sx={{ p: 3, pt: 0 }}>
            <Stack spacing={2}>
              <InfoRow label="Pool Type" value={pool.overview?.poolType || '-'} />
              <InfoRow label="Pool ID" value={pool.overview?.poolId || '-'} />
              <InfoRow label="Created On" value={pool.overview?.createdOn || '-'} />
              <InfoRow label="Associated SPV" value={pool.overview?.associatedSpv || '-'} />
              <InfoRow
                label="Status"
                value={pool.overview?.status || '-'}
                useLabel
                color={statusColor}
              />
            </Stack>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: 1, borderRadius: 3 }}>
          <Box sx={{ px: 3, py: 2.5 }}>
            <Typography variant="h6">Pool Financial Summary</Typography>
          </Box>

          <Box sx={{ p: 3, pt: 0 }}>
            <Box
              sx={{
                p: 3,
                mb: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Current Pool Value
              </Typography>
              <Typography variant="h3" sx={{ color: 'primary.main' }}>
                {pool.financialSummary?.currentPoolValue || '-'}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Deployed
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'success.main' }}>
                    {pool.financialSummary?.deployed || '-'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.06),
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Available
                  </Typography>
                  <Typography variant="h5">{pool.financialSummary?.available || '-'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Avg Haircut
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'warning.main' }}>
                    {pool.financialSummary?.avgHaircut || '-'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Expected Yield
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'success.main' }}>
                    {pool.financialSummary?.expectedYield || '-'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ borderRadius: 3 }}>
          <Box sx={{ px: 3, py: 2.5 }}>
            <Typography variant="h6">Transaction Flow Mechanics</Typography>
          </Box>

          <Box sx={{ p: 3, pt: 0 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {pool.transactionFlow?.description || '-'}
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
                Flow Process
              </Typography>

              <Stack spacing={1.5}>
                {flowSteps.map((step, index) => (
                  <FlowStep
                    key={step.title}
                    index={index + 1}
                    title={step.title}
                    description={step.description}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}

PoolOverviewTab.propTypes = {
  pool: PropTypes.object,
};
