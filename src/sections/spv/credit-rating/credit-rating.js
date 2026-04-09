
import { yupResolver } from "@hookform/resolvers/yup";

import { Button, Card, Grid, MenuItem, Typography } from "@mui/material";
import { alpha, Box, Container, Stack } from "@mui/system";
import { useForm } from "react-hook-form";
import FormProvider, { RHFCustomFileUploadBox, RHFSelect, RHFTextField } from "src/components/hook-form";
import Iconify from "src/components/iconify";
import PropTypes from 'prop-types';

import * as yup from 'yup';
import { useEffect, useMemo, useState } from "react";
import RHFDatePicker from "src/components/hook-form/rhf-date-picker";

const normalizeDate = (value) => {
    if (!value) {
        return null;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

function CreditRating({ disabled, currData, percent, saveStepData, setActiveStepId }) {

    const CardData = [
        { heading: 'CRISIL', subHeading: 'CRISIL Ltd. (S&P Global)' },
        { heading: 'ICRA', subHeading: "ICRA Ltd. (Moody's)" },
        { heading: 'CARE', subHeading: 'CARE Ratings Ltd.' },
        { heading: 'Brickwork', subHeading: 'Brickwork Ratings India' },

    ];

    const [selectedId, setSelectedId] = useState();
    const category = ['pending- Awaiting CRISIL Review', 'AA+ (sf)- Excellent', 'AA (sf)-Very Strong', 'A+ (sf)-strong', 'A (sf)-Adequate'];

    const creditSchema = yup.object().shape({
        applicationNumber: yup.string().required('Application Reference No. Is Required'),
        applicationDate: yup.date().required('Application Date is Required').max(new Date(), 'Can Not be Select Future Date'),
        ratingObtained: yup.string().required('Settor Info is Required'),
        expectedRatingDate: yup.date().required('Expected Rating Date is Required').min(yup.ref('applicationDate'), 'Expected Rating Date is Must be After Than Application Date '),
    })

    const defaultValues = useMemo(() => ({
        applicationNumber: currData?.applicationNumber || '',
        applicationDate: normalizeDate(currData?.applicationDate),
        ratingObtained: currData?.ratingObtained || '',
        expectedRatingDate: normalizeDate(currData?.expectedRatingDate),
        ratingLetter: currData?.ratingLetter || '',
    }), [currData]);
    ;

    const methods = useForm({
        resolver: yupResolver(creditSchema),
        defaultValues,
    })

    const { handleSubmit, reset, formState: { isSubmitting }, watch } = methods;

    const values = watch();

    const requiredFields = [
        'applicationNumber',
        'applicationDate',
        'ratingObtained',
        'expectedRatingDate',
    ];

    useEffect(() => {
        let completed = 0;

        requiredFields.forEach((field) => {
            if (Array.isArray(values[field]) && values[field]?.length > 0) {
                completed += 1;
            }

            if ((values[field]) && !Array.isArray(values[field])) {
                completed += 1;
            }
        })

        const percentValue = (completed / requiredFields.length) * 100;
        percent?.(percentValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        values.applicationNumber,
        values.applicationDate,
        values.ratingObtained,
        values.expectedRatingDate,
    ]);


    // console.log(values);

    const onSubmit = handleSubmit(async (data) => {
        saveStepData(data);
        // setActiveStepId('isin_application');
    });
    useEffect(() => {
        if (currData) {
            reset(defaultValues);
        }
    }, [defaultValues, currData, reset])


    const handleCardClick = (id) => {
        setSelectedId(id);

    };


    return (
        <Container>

            <FormProvider methods={methods} onSubmit={onSubmit} >
                <Stack spacing={3}>
                    <Box display="flex" alignItems="center" gap={2}>

                        <Box>
                            <Typography variant="h4" color="primary" fontWeight={600}>
                                Credit Rating
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Obtain a SEBI-registered credit rating for PTCs. Mandatory before NSDL/CDSL will process the ISIN application. Expected turnaround: 7–10 business days.                                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            alignContent: "center",
                            gap: 2,
                            p: 1,
                            borderRadius: 1,
                            border: (theme) => `solid 2px ${alpha(theme.palette.warning.main, 0.9)}`,
                            backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.1),
                            color: (theme) => alpha(theme.palette.warning.main, 0.9),

                            mb: 1
                        }}
                    >
                        <Box sx={{ p: 1, pr: 0 }}>
                            <Iconify icon="flat-color-icons:flash-on" width={20} height={20} />
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{
                            }}>

                                SEBI Requirement:
                            </Typography>
                            <Typography variant='subtitle2' sx={{ color: "gray" }} fontWeight={400}> Per SEBI (Public Offer and Listing of Securitised Debt Instruments) Regulations 2008, all securitised instruments offered to more than 49 investors must carry a valid credit rating from a SEBI-registered CRA. ISIN application will be rejected without this.</Typography>
                        </Box>

                    </Box>

                    <Card>
                        <Box display="flex" alignItems="center" sx={{ p: 3, pb: 0 }}>
                            <Typography fontWeight={600}>
                                Select Credit Rating Agency
                            </Typography>
                        </Box>
                        <Grid container p={2}>
                            {CardData.map((item, i) => (
                                <Grid xs="12" md="3">
                                    <Card
                                        sx={(theme) => ({
                                            m: 1,
                                            borderRadius: 2,
                                            boxShadow: theme.shadows[3],
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2,
                                            cursor: 'pointer',
                                            transition: '0.1s',
                                            border: selectedId === i ? (theme) => `solid 1px ${alpha(theme.palette.info.main, 0.9)}` : null,
                                            backgroundColor: selectedId === i ? (theme) => alpha(theme.palette.info.main, 0.1) : null,
                                            '&:hover': {
                                                transform: 'scale(1.01)',
                                                boxShadow: theme.shadows[8],
                                            },
                                        })}

                                        onClick={() => handleCardClick(i)}
                                    >

                                        <Box alignItems="center" textAlign="center" p={5}>
                                            <Typography fontWeight={600}>
                                                {item.heading}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.subHeading}
                                            </Typography>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                    </Card>

                    <Card>

                        <Box display="flex" alignItems="center" sx={{ p: 3, pb: 0 }}>
                            <Box display="flex" alignItems="center" gap={2}>

                                <Box>
                                    <Typography fontWeight={600}>
                                        Application Details
                                    </Typography>
                                    {/* <Typography variant="body2" color="text.secondary">
                                        Generate and execute the Trust Deed — the master legal framework. Escrow can only be opened after this is signed.
                                    </Typography> */}
                                </Box>
                            </Box>

                        </Box>

                        <Stack spacing={3} p={{ xs: 3 }}>
                            {/* <Typography variant="subtitle2">Invoice Metadata</Typography> */}
                            <Box
                                columnGap={2}
                                rowGap={3}
                                display="grid"
                                gridTemplateColumns={{
                                    xs: 'repeat(1, 1fr)',
                                    md: 'repeat(2, 1fr)',
                                }}
                            >
                                <RHFTextField name="applicationNumber" label="Application Reference No." type="text" disabled={disabled} />
                                <RHFDatePicker name="applicationDate" label="Application Date" maxDate={new Date()} disabled={disabled} />
                            </Box>
                            <Box
                                columnGap={2}
                                rowGap={3}
                                display="grid"
                                gridTemplateColumns={{
                                    xs: 'repeat(1, 1fr)',
                                    md: 'repeat(2, 1fr)',
                                }}
                            >
                                <Box>
                                    <RHFSelect  name="ratingObtained" label="Rating Obtained"  >
                                        {category.map((cat) => (
                                            <MenuItem key={cat} value={cat}>
                                                {cat}
                                            </MenuItem>
                                        ))}
                                    </RHFSelect>
                                    <Typography variant="body2" color="text.secondary" mt={1}>Expected rating: AA (sf) based on pool quality</Typography>
                                </Box>
                                <RHFDatePicker name="expectedRatingDate" label="Expected Rating Date" disabled={disabled} />
                            </Box>
                            <Box
                                columnGap={2}
                                rowGap={3}
                                display="grid"
                                gridTemplateColumns={{
                                    xs: 'repeat(1, 1fr)',
                                    md: 'repeat(1, 1fr)',
                                }}
                            >
                                <RHFCustomFileUploadBox name="ratingLetter" label="Upload Rating Letter (PDF)" disabled={disabled} />

                            </Box>
                        </Stack>
                    </Card>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignContent: "center", gap: 2 }}>
                        <Button type="submit" variant="contained" color="primary" loading={isSubmitting}>Next</Button>
                    </Box>
                </Stack>

            </FormProvider >
        </Container >
    )

}

CreditRating.propTypes = {
    currData: PropTypes.any,
    disabled: PropTypes.any,
    percent: PropTypes.func,
    saveStepData: PropTypes.func.isRequired,
    setActiveStepId: PropTypes.func.isRequired,
};

export default CreditRating;
