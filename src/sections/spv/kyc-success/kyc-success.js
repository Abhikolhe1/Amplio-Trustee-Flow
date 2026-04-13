import React from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Container,
  Paper,
} from "@mui/material";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTheme } from "@mui/material/styles";

export default function SpvLiveSuccess() {
  const theme = useTheme();

  const chips = [
    { label: "ISIN INE-F2G4-2026-001" },
    { label: "Pool ₹40,000 / ₹50,00,000" },
    { label: "Escrow AXIS-ESC-T1-001" },
    { label: "Rating CRISIL AA (sf)" },
    { label: "Merchants M1 • M2 • M3" },
    { label: "Yield 10% p.a." },
  ];

  return (
    <Container maxWidth="md">
      <Paper
        elevation={0}
        sx={{
          textAlign: "center",
          py: 8,
          px: 4,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          {/* <CheckCircleIcon
            sx={{
              fontSize: 70,
              color: theme.palette.success.main,
            }}
          /> */}
        </Box>

        <Typography
          variant="h4"
          fontWeight={700}
          color={theme.palette.primary.main}
          gutterBottom
        >
          SPV is Now Live
        </Typography>

        <Typography
          variant="body1"
          color={theme.palette.text.secondary}
          maxWidth="600px"
          mx="auto"
          mb={4}
        >
          RZP-T1-SECURITIZATION-001 is active. Razorpay T1 receivables are now
          being automatically routed to the trust pool. Real-time monitoring
          enabled.
        </Typography>

        <Stack
          direction="row"
          flexWrap="wrap"
          justifyContent="center"
          gap={1.5}
          mb={4}
        >
          {chips.map((chip, index) => (
            <Chip
              key={index}
              label={chip.label}
              variant="outlined"
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                fontWeight: 500,
                px: 1,
              }}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: theme.palette.success.main,
              "&:hover": {
                backgroundColor: theme.palette.success.dark,
              },
              px: 3,
              py: 1.2,
              fontWeight: 600,
            }}
          >
            Go to Live Dashboard →
          </Button>

          <Button
            variant="outlined"
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              px: 3,
              py: 1.2,
              fontWeight: 600,
              "&:hover": {
                borderColor: theme.palette.primary.dark,
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            Create T2 SPV (Next)
          </Button>
        </Stack>

        <Typography
          variant="caption"
          color={theme.palette.text.disabled}
        >
          System Timestamp: 15 Apr 2026 · FinSecure Trustee Services Ltd.
        </Typography>
      </Paper>
    </Container>
  );
}