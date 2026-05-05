import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { SPV_RECENT_PTC_ISSUANCES } from 'src/_mock/_spv';

export default function SpvRecentPtcIssuances() {
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
          {SPV_RECENT_PTC_ISSUANCES.title}
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          {SPV_RECENT_PTC_ISSUANCES.items.map((item) => (
            <Box
              key={item.id}
              sx={{
                borderRadius: 3,
                bgcolor: 'grey.100',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                px: 2.5,
                py: 2.25,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {item.series}
                </Typography>

                <Chip
                  label={item.yield}
                  color="success"
                  variant="soft"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 2, md: 8 }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Amount
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {item.amount}
                  </Typography>
                </Stack>

                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Tenor
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {item.tenor}
                  </Typography>
                </Stack>

                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Issued
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {item.issuedOn}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
