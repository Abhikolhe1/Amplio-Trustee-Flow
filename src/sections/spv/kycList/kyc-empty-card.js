import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

export default function KycEmptyCard({ onAddSpv }) {
  return (
    <Card
      sx={{
        px: 3,
        py: 5,
        textAlign: 'center',
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Iconify icon="solar:documents-bold-duotone" width={48} />

        <Stack spacing={1}>
          <Typography variant="h5">No SPV application yet</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
            Create your first SPV application to open the stepper and start the KYC flow.
          </Typography>
        </Stack>

        <Button
          color="primary"
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={onAddSpv}
        >
          Add SPV
        </Button>
      </Stack>
    </Card>
  );
}

KycEmptyCard.propTypes = {
  onAddSpv: PropTypes.func,
};
