import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Label from 'src/components/label';
import { alpha } from '@mui/material/styles';

export default function GatewayDistributionCard({ item }) {
  return (
    <Card
      sx={{
        borderRadius: 2.5,
        boxShadow: 'none',
        border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
          <Typography variant="h6">{item.gateway}</Typography>
          <Label variant="soft" color="info">
            {item.percentage}
          </Label>
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>
              Merchants
            </Typography>
            <Typography variant="h5">{item.merchants}</Typography>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>
              Total Volume
            </Typography>
            <Typography variant="h5" sx={{ color: 'success.main' }}>
              {item.totalVolume}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}

GatewayDistributionCard.propTypes = {
  item: PropTypes.object,
};
