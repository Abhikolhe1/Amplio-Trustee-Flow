import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Button, Card, Chip, MenuItem, Typography } from "@mui/material";
import { alpha, Box, Container, Stack } from "@mui/system";
import { useForm } from "react-hook-form";
import FormProvider, { RHFSelect, RHFTextField } from "src/components/hook-form";
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useEffect, useMemo } from "react";

import DocumentCard from "src/components/card/documentCard";

function LegelStructureView({ percent, setActiveStepId, currData, saveStepData }) {

    const Law = [
        { value: 'act', label: 'Indian Trusts Act, 1882 + SARFAESI Act, 2002' },
        { value: 'only', label: 'Indian Trusts Act, 1882 only' },
    ];
    const Clause = [
        { value: 'full', label: 'Full Isolation (Recommended)' },
        { value: 'partial', label: 'Partial Isolation' },
    ];

    const documents = [
        {
            id: 1,
            title: "Trust Deed — Generated",
            description:
                "PDF auto-generated with all SPV parameters · 14 pages",
            type: "primary",
            icon: "qlementine-icons:success-16",
            docLink: '/assets/spv-Document/trust_deed_realistic_demo.pdf',
            button: "View Draft"
        },

        {
            id: 5,
            title: "Trustee E-Sign — Pending",
            description:
                "Priya Mehta (Lead Trustee) · Sent via DigiLocker/eSign India",
            type: "warning",
            icon: "solar:arrow-right-outline",
            button: "Sign Now →"
        },
        {
            id: 6,
            title: "Settlor E-Sign — Waiting",
            description:
                "FinFlow Capital authorized signatory · Unlocks after Trustee signs",
            type: "error",
            icon: "mynaui:three-solid",
        },
        {
            id: 7,
            title: "Stamp Duty & Registration — Locked",
            description:
                "Maharashtra Stamp Act applicable · ₹500 stamp duty",
            type: "error",
            icon: "mynaui:four-solid",
        },

    ];


    const defaultValues = useMemo(() => ({
        trustName: currData?.trustName || '',
        trusteeEntity: currData?.trusteeEntity || '',
        settlor: currData?.settlor || '',
        governingLaw: currData?.governingLaw || '',
        bankruptcy: currData?.bankruptcy || '',
        trustDuration: currData?.trustDuration || '',
    }), [currData]);


    const trustSchema = yup.object().shape({
        trustName: yup.string().required('Trust Name Is Required'),
        trusteeEntity: yup.string().required('Trust Entity is Required'),
        settlor: yup.string().required('Settor Info is Required'),
        governingLaw: yup.string().required("Law is Required"),
        bankruptcy: yup.string().required("Bankruptcy Remoteness Clause is Required"),
        trustDuration: yup.string().required('Duration Is Required'),
    })
    const methods = useForm({
        resolver: yupResolver(trustSchema),
        defaultValues,
    })
    const { handleSubmit, control, reset, setValue, formState: { isSubmitting, errors }, watch } = methods;

    const requiredFields = [
        'trustName',
        'trusteeEntity',
        'settlor',
        'governingLaw',
        'bankruptcy',
        'trustDuration',
    ];
    const values = watch();

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
        values.trustName,
        values.trusteeEntity,
        values.settlor,
        values.governingLaw,
        values.bankruptcy,
        values.trustDuration,

    ]);


    const onSubmit = handleSubmit(async (data) => {
        console.log("Form Data", data);
        saveStepData(data);
        setActiveStepId('escrow_setup')
    });

    return (
        <Container>
            <FormProvider methods={methods} onSubmit={onSubmit} >

                <Alert severity="info" sx={{ mb: 2 }}>
                    Why Legal first? The Trust Deed establishes the legal SPV entity under the Trustee's fiduciary control.
                    Axis Bank will only open the escrow account after receiving a signed copy of the Trust Deed.
                    This step must be completed before Step 5.
                </Alert>
                <Card>

                    <Box display="flex" alignItems="center" sx={{ px: 3, py: 1 }}>
                        <Box display="flex" alignItems="center" gap={2}>

                            <Box>
                                <Typography color="primary" py={1} fontWeight={600}>
                                    Legal Structure & Trust Deed
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Generate and execute the Trust Deed — the master legal framework. Escrow can only be opened after this is signed.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Stack spacing={3} p={{ xs: 3 }}>
                        <Box
                            columnGap={2}
                            rowGap={3}
                            display="grid"
                            gridTemplateColumns={{
                                xs: 'repeat(1, 1fr)',
                                md: 'repeat(2, 1fr)',
                            }}
                        >
                            <RHFTextField name="trustName" label="Trust Name (Legal)" type="text" />
                            <RHFTextField name="trusteeEntity" label="Trustee Entity" type="text" />
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
                            <RHFTextField name="settlor" label="Settlor (Platform NBFC)" type="text" />
                            <RHFSelect
                                name="governingLaw"
                                label="Governing Law*"
                            >
                                {Law.map((role) => (
                                    <MenuItem key={role.value} value={role.value}>
                                        {role.label}
                                    </MenuItem>
                                ))}
                            </RHFSelect>

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
                                <RHFSelect
                                    name="bankruptcy"
                                    label="Bankruptcy Remoteness Clause*"
                                >
                                    {Clause.map((role) => (
                                        <MenuItem key={role.value} value={role.value}>
                                            {role.label}
                                        </MenuItem>
                                    ))}
                                </RHFSelect>
                                <Typography variant="body2" mt={1} color="text.secondary">Full isolation protects investors if platform defaults</Typography>
                            </Box>
                            <RHFTextField name="trustDuration" label="Trust Duration" type="text" />

                        </Box>


                      

                    </Stack>
                </Card>
                
                <Card sx={{p:3, mt:3}}>
                <Stack spacing={2}>
                            {documents.map((doc) => (
                                <DocumentCard title={doc.title} description={doc.description} icon={doc.icon} docLink={doc.docLink} button={doc.button} />

                            ))}
                        </Stack>
                </Card>
                <Box sx={{ display: "flex", justifyContent: "flex-end", alignContent: "center", p: 3, gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"

                    >
                        Next
                    </Button>
                </Box>

            </FormProvider >
        </Container >
    )

}

LegelStructureView.propTypes = {
    percent: PropTypes.func.isRequired,
    setActiveStepId: PropTypes.func.isRequired,
};

export default LegelStructureView;
