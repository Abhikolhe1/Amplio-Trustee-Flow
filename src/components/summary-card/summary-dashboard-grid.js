import PropTypes from 'prop-types';
import { Card, Stack, Typography, Box, Tooltip } from '@mui/material';
import Iconify from 'src/components/iconify';

export default function SummaryDashboardGrid({ title, value, icon }) {
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Stack spacing={1}>
        <Tooltip title={title}>
          <Typography variant="body2" sx={{
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 150,
          }}>
            {title}
          </Typography>
        </Tooltip>

        <Typography variant="h5">{value}</Typography>
      </Stack>

      <Box
        sx={{
          width: 40,
          height: 40,
          color: 'primary.main'

        }}
      >
        <Iconify icon={icon} width={24} />
      </Box>
    </Card>
  );
}

SummaryDashboardGrid.propTypes = {
  title: PropTypes.string,
  value: PropTypes.any,
  icon: PropTypes.string,
};