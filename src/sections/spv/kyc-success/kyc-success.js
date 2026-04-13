import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Chip, Stack, Container, Card, Icon } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import { format } from 'date-fns';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';

export default function SpvLiveSuccess() {
  const theme = useTheme();
  const router = useRouter();
  const [spv, setSpv] = useState('');

  useEffect(() => {
    const formData = JSON.parse(localStorage.getItem('formData'));
    const spvName = formData?.basic_info?.spvName;
    setSpv(spvName);
  }, []);

  const data = {
    title: 'SPV is Now Live',
    description: `${spv}  is active. Razorpay T1 receivables are now being automatically routed to the trust pool. Real-time monitoring enabled.`,
    timestamp: `${format(new Date(), 'dd MMM yyyy')} · Axis Trustee Services Ltd`,
    actions: [
      {
        label: 'Go to Live Dashboard',
        variant: 'contained',
        color: 'success',
      },
      // {
      //   label: 'Create T2 SPV (Next)',
      //   variant: 'outlined',
      //   color: 'primary',
      // },
    ],
    chips: [
      'ISIN INE-F2G4-2026-001',
      'Pool ₹40,000 / ₹50,00,000',
      'Escrow AXIS-ESC-T1-001',
      'Rating CRISIL AA (sf)',
      'Merchants M1 • M2 • M3',
      'Yield 10% p.a.',
    ],
  };

  const handleDashboard = () => {
    router.push(paths.dashboard.spvkyc.list);
  };

  return (
    <Container maxWidth="md">
      <Card
        sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Icon */}
        <Box display="flex" justifyContent="center" mb={2}>
          <Iconify
            icon="mdi:check-circle-outline"
            width={70}
            height={70}
            color={theme.palette.success.main}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          // fontWeight={700}
          color="primary"
          align="center"
          gutterBottom
        >
          {data.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="subtitle2"
          color={theme.palette.text.secondary}
          align="center"
          maxWidth="600px"
          mx="auto"
          mb={4}
        >
          {data.description}
        </Typography>

        {/* Chips */}
        {/* <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1.5} mb={4}>
          {data.chips.map((chip, index) => (
            <Chip
              key={index}
              label={chip}
              variant="outlined"
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                fontWeight: 500,
              }}
            />
          ))}
        </Stack> */}

        {/* Actions */}
        <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
          {data.actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              sx={{
                px: 3,
                py: 1.2,
                ...(action.color === 'success' && {
                  backgroundColor: theme.palette.success.main,
                  '&:hover': {
                    backgroundColor: theme.palette.success.dark,
                  },
                }),
                ...(action.color === 'primary' && {
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: theme.palette.action.hover,
                  },
                }),
              }}
              onClick={handleDashboard}
            >
              {action.label}
            </Button>
          ))}
        </Stack>

        {/* Footer */}
        <Typography
          variant="caption"
          color={theme.palette.text.disabled}
          align="center"
          display="block"
        >
          {data.timestamp}
        </Typography>
      </Card>
    </Container>
  );
}
