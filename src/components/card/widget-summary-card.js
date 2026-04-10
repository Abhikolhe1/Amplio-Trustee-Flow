import PropTypes from 'prop-types';

// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';

// component
import Iconify from 'src/components/iconify';

// utils
import { fPercent } from 'src/utils/format-number';

export default function WidgetSummaryCard({ timing, title, total, sx, ...other }) {
  const theme = useTheme();

  function formatNumber(num) {
    const number = Number(num);

    if (number >= 10000000) {
      return `${(number / 10000000).toFixed(2)} Cr`;
    }

    if (number >= 100000) {
      return `${(number / 100000).toFixed(2)} L`;
    }

    if (number >= 1000) {
      return `${(number / 1000).toFixed(2)} K`;
    }

    return number;
  }

  return (
    <Card sx={{ width: '100%', height: '100%', p: 3, minHeight: 120, ...sx }} {...other}>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Tooltip title={title || ''} arrow>
            <Typography
              variant="subtitle2"
              sx={{
                maxWidth: '75%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {title}
            </Typography>
          </Tooltip>
        </Box>

        <Stack direction="row" alignItems="center" sx={{ mt: 2, mb: 1 }}>
          <Typography variant="h5" noWrap>
            {total}
          </Typography>
        </Stack>

        {timing && (
          <Tooltip title={timing || ''} arrow>
            <Typography
              variant="caption"
              sx={{
                color: 'grey',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {timing}
            </Typography>
          </Tooltip>
        )}
      </Box>
    </Card>
  );
}

WidgetSummaryCard.propTypes = {
  sx: PropTypes.object,
  title: PropTypes.string,
  timing: PropTypes.string,
  total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

// ----------------------------------------------------------------------

export function TruncatedTypography({ text, icon }) {
  const theme = useTheme();

  const words = text?.split(' ') || [];
  const isTruncated = words.length > 3;
  const truncatedText = isTruncated ? `${words.slice(0, 3).join(' ')}...` : text;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minWidth: 0, // allows shrinking
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <Tooltip title={isTruncated ? text : ''} arrow disableHoverListener={!isTruncated}>
          <Typography variant="subtitle2" noWrap>
            {truncatedText}
          </Typography>
        </Tooltip>
      </Box>

      {icon && (
        <Box
          sx={{
            flexShrink: 0,
            ml: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: theme.spacing(3.5),
            height: theme.spacing(3.5),
            borderRadius: 1,
            bgcolor: alpha(theme.palette.info.main, 0.08),
            color: theme.palette.primary.main,
          }}
        >
          <Iconify icon={icon} width={20} height={20} />
        </Box>
      )}
    </Box>
  );
}
TruncatedTypography.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.string,
};
