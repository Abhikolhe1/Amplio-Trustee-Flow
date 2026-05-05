import PropTypes from 'prop-types';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// components
import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function SummaryCard({ title, data, sx, ...other }) {
  return (
    <Card sx={{ p: 3, height: 1, ...sx }} {...other}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {title}
      </Typography>

      <Stack spacing={2}>
        {data.map((item) => (
          <Stack
            key={item.label}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
              border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
              transition: (theme) => theme.transitions.create(['background-color']),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
              },
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {item.label}
            </Typography>

            {item.useLabel ? (
              <Label color={item.color || 'default'} variant="soft" sx={{ minWidth: 80 }}>
                {item.value}
              </Label>
            ) : (
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: item.color ? `${item.color}.main` : 'text.primary',
                  fontWeight: 600
                }}
              >
                {item.value}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}

SummaryCard.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any,
      color: PropTypes.string,
      useLabel: PropTypes.bool,
    })
  ),
  sx: PropTypes.object,
  title: PropTypes.string,
};
