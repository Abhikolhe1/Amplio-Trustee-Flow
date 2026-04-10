import { Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

function DepositoryCard({ selectedDepository, onSelect }) {
  const options = [
    {
      id: 'nsdl',
      title: 'NSDL',
      subtitle: 'National Securities Depository Limited',
      tag: 'Preferred for institutional PTCs  & T-bills',
    },
    {
      id: 'cdsl',
      title: 'CDSL',
      subtitle: 'Central Depository Services Limited',
      tag: 'Preferred for retail investor PTCs',
    },
  ];

  return (
    <Card
      sx={{
        p: 2,
      }}
    >
      <Stack mb={2}>
        <Typography variant="subtitle1" color="primary" gutterBottom>
          Select Depository
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {options.map((option) => (
          <Grid item xs={12} md={6} key={option.id}>
            <Card
              onClick={() => onSelect(option.id)}
              sx={(theme) => ({
                cursor: 'pointer',
                border: '1px solid',
                borderColor:
                  selectedDepository === option.id
                    ? theme.palette.primary.light
                    : theme.palette.divider,
                backgroundColor:
                  selectedDepository === option.id
                    ? theme.palette.primary.lighter
                    : theme.palette.background.paper,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: theme.palette.primary.light,
                },
              })}
            >
              <CardContent>
                <Typography variant="h6">{option.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.subtitle}
                </Typography>

                <Chip
                  label={option.tag}
                  size="small"
                  sx={(theme) => ({
                    mt: 1,
                    backgroundColor: theme.palette.primary.main + '05',
                    // color: theme.palette.primary.main,
                  })}
                  // color="primary"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}

export default DepositoryCard;
