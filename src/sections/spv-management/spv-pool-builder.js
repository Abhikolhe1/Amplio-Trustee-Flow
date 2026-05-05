import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { SPV_POOL_BUILDER } from 'src/_mock/_spv';

function getStepColors(state) {
  if (state === 'done') {
    return {
      bg: 'success.main',
      color: 'common.white',
      text: 'text.primary',
      borderColor: 'success.main',
    };
  }

  if (state === 'active') {
    return {
      bg: 'primary.main',
      color: 'common.white',
      text: 'primary.main',
      borderColor: 'primary.main',
    };
  }

  return {
    bg: 'background.paper',
    color: 'text.secondary',
    text: 'text.secondary',
    borderColor: 'divider',
  };
}

export default function SpvPoolBuilder() {
  return (
    <Card
      sx={{
        mt: 3,
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {SPV_POOL_BUILDER.title}
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 2, md: 3.5 }}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 3.5 }}
        >
          {SPV_POOL_BUILDER.steps.map((step) => {
            const colors = getStepColors(step.state);

            return (
              <Stack key={step.id} direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    bgcolor: colors.bg,
                    color: colors.color,
                    border: '1px solid',
                    borderColor: colors.borderColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {step.id}
                </Box>

                <Typography
                  variant="subtitle2"
                  sx={{
                    color: colors.text,
                    fontWeight: step.state === 'idle' ? 500 : 700,
                  }}
                >
                  {step.label}
                </Typography>
              </Stack>
            );
          })}
        </Stack>

        <Box
          sx={{
            borderRadius: 3,
            bgcolor: 'grey.100',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            p: { xs: 2, md: 3 },
          }}
        >
          <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700 }}>
            {SPV_POOL_BUILDER.sectionTitle}
          </Typography>

          <Stack spacing={1.75}>
            {SPV_POOL_BUILDER.haircuts.map((row) => (
              <Stack
                key={row.label}
                direction="row"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent="space-between"
                spacing={2}
                sx={{
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  px: 2,
                  py: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  {row.label}
                </Typography>

                <Stack direction="row" spacing={2.5} alignItems="center">
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {row.value}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 700 }}>
                    {row.amount}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}
