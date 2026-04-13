// import { Box, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
// import React, { useState } from 'react';
// import Label from 'src/components/label';

// function ApplicationTracker({ status = 'pending' }) {
//   const [progressValue, setProgressValue] = useState(65);

//   const steps = [
//     {
//       label: 'Application Submitted',
//       status: 'completed',
//       description: 'Ref: NSDL-PTC-2026-9912',
//       date: '12 Apr 2026',
//     },
//     {
//       label: 'Depository Verification',
//       status: 'active',
//       description: 'NSDL cross-checking SEBI Master Database · CRISIL rating verified',
//     },
//     {
//       label: 'ISIN Allocation',
//       status: 'pending',
//       description: 'Estimated 15 Apr 2026 · 3-5 business days',
//     },
//   ];

//   return (
//     <Card sx={{ mt: 3 }}>
//       <CardContent>
//         <Typography variant="subtitle1" color="primary" gutterBottom>
//           Application Tracker
//         </Typography>

//         {/* Progress */}
//         <Box sx={{ mb: 2 }}>
//           <Stack mb={2} direction="row" justifyContent="space-between" alignItems="center">
//             <Typography variant="body2"> Verification Progress</Typography>
//             <Typography variant="body1" color="primary">
//               {progressValue}% Complete
//             </Typography>
//           </Stack>
//           <LinearProgress
//             variant="determinate"
//             value={progressValue}
//             sx={{ height: 8, borderRadius: 5 }}
//           />
//         </Box>

//         {/* Steps */}
//         <Stack spacing={2} mb={3}>
//           {steps.map((step, index) => (
//             <Box key={index} sx={{ display: 'flex', gap: 2 }}>
//               {/* Dot */}
//               <Box
//                 sx={(theme) => ({
//                   width: 10,
//                   height: 10,
//                   borderRadius: '50%',
//                   mt: '6px',
//                   backgroundColor:
//                     step.status === 'completed'
//                       ? theme.palette.success.main
//                       : step.status === 'active'
//                       ? theme.palette.primary.main
//                       : theme.palette.grey[400],
//                 })}
//               />

//               {/* Content */}
//               <Box>
//                 <Typography variant="body2">{step.label}</Typography>
//                 {step.date && (
//                   <Typography variant="caption" color="text.secondary">
//                     {step.date}
//                   </Typography>
//                 )}
//                 <Typography variant="caption" color="text.secondary">
//                   {step.description}
//                 </Typography>
//               </Box>
//             </Box>
//           ))}
//         </Stack>

//         {/* ISIN Box */}
//         <Box
//           sx={(theme) => ({
//             mt: 1,
//             p: 2,
//             borderRadius: 1,
//             border: '1px dashed',
//             borderColor: theme.palette.primary.main,
//             backgroundColor: theme.palette.primary.main + '03',
//           })}
//         >
//           <Typography variant="body2"> Projected ISIN</Typography>
//           <Box
//             sx={(theme) => ({
//               m: 2,
//               p: 2,
//               borderRadius: 2,
//               border: '1px solid',
//               borderColor: theme.palette.primary.main,
//               backgroundColor: theme.palette.primary.main + '06',
//             })}
//           >
//             <Stack direction="row" justifyContent="space-between" alignItems="center">
//               <Typography variant="subtitle1">INE - F2G4 - 2026 - 001</Typography>

//               {status && (
//                 <Label
//                   variant="soft"
//                   color={
//                     (status === 'completed' && 'success') ||
//                     (status === 'success' && 'success') ||
//                     (status === 'verified' && 'success') ||
//                     (status === 'failed' && 'error') ||
//                     (status === 'pending' && 'warning') ||
//                     'default'
//                   }
//                   sx={{
//                     px: 1,
//                     py: 0.5,
//                     textTransform: 'capitalize',
//                   }}
//                 >
//                   {status}
//                 </Label>
//               )}
//             </Stack>
//           </Box>
//           <Typography variant="caption" color="text.secondary">
//             Final ISIN will be confirmed by NSDL after document verification · Est. 15 Apr 2026
//           </Typography>
//         </Box>
//       </CardContent>
//     </Card>
//   );
// }

// export default ApplicationTracker;
