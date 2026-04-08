import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, Button, Card, Chip, MenuItem, Typography } from "@mui/material";
import { Box, Container, Stack } from "@mui/system";
import { useForm } from "react-hook-form";
import FormProvider, { RHFSelect, RHFTextField } from "src/components/hook-form";
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useEffect } from "react";

function EscrowSetupView({ percent, setActiveStepId }) {


    const bank = [
        { value: 'axis', label: 'Axis Bank (Preferred — Active Relationship)' },
        { value: 'hdfc', label: 'HDFC Bank' },
        { value: 'icici', label: 'ICICI Bank' },
        { value: 'kotak', label: 'Kotak Mahindra Bank' },
    ];

    const defaultValues = {
        verification: '',
        expected: '',
        bank: '',
        location: '',
    };


    const trustSchema = yup.object().shape({
        verification: yup.string().required('Trust Name Is Required'),
        expected: yup.string().required(' is Required'),
        bank: yup.string().required("bank Remoteness bank is Required"),
        location: yup.string().required('Duration Is Required'),
    })
    const methods = useForm({
        resolver: yupResolver(trustSchema),
        defaultValues,
    })
    const { handleSubmit, control, reset, setValue, formState: { isSubmitting, errors }, watch } = methods;

    const requiredFields = [
        'verification',
        'expected',
        'bank',
        'location',
    ];
    const values = watch();
    // useEffect(() => {
    //     percent(50);
    // }, [percent]);
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
        values.verification,
        values.expected,
        values.bank,
        values.location,

    ]);
    // console.log(values);
    const handleGenerateData = () => {
      
        setValue('location', 'Pune Main Branch');
        setValue('bank', 'axis');
        setValue('verification', 'Trustee + Platform Dual Authorization');
        setValue('expected', '2-3 Business Days');
    };
    const onSubmit = handleSubmit(async (data) => {
        console.log("Form Data", data);
        setActiveStepId('legal_documents')
    });

    return (
        <Container>
            <FormProvider methods={methods} onSubmit={onSubmit} >
                <Alert severity="success" sx={{ mb: 2 }}>
                    <strong>Trust Deed Signed.</strong> Axis Bank escrow accounts can now be opened.
                    All escrow accounts will operate under the Trustee Control Agreement, and the
                    platform cannot debit funds without dual trustee authorization.
                </Alert>
                <Card>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ px: 3, py: 2 }}
                    >
                        <Box>
                            <Typography fontWeight={600}>
                                Escrow Setup
                            </Typography>
                            <Box mt={1}>
                                <Typography variant="body2" color="text.secondary">
                                    Open 4 dedicated Axis Bank escrow accounts — 1 collection escrow per SPV bucket + 1 reserve buffer account.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    All accounts under Trustee sovereignty.
                                </Typography>
                            </Box>
                        </Box>
                 
                        <Button variant="contained" color="primary" sx={{ minWidth: 150 }} onClick={handleGenerateData}>
                            Generate Data
                        </Button>
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
                            <RHFSelect
                                name="bank"
                                label="Bank*"
                                InputLabelProps={{ shrink: true }}
                            >
                                {bank.map((role) => (
                                    <MenuItem key={role.value} value={role.value}>
                                        {role.label}
                                    </MenuItem>
                                ))}
                            </RHFSelect>
                            <RHFTextField name="location" label="Branch / City" type="text" />

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
                            <Stack >
                                <RHFTextField name="verification" label="Verification Method" type="text" />
                                <Typography variant="body2" mt={1} color="text.secondary" >Bank freezes debit rights. All outflows require Trustee + Platform dual digital signature.</Typography>
                            </Stack>
                            <RHFTextField name="expected" label="Expected Setup Time" type="text" />
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", alignContent: "center", p: 3, gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                            >
                                Next
                            </Button>
                        </Box>
                    </Stack>
                </Card>
            </FormProvider >
        </Container >
    )
}
EscrowSetupView.propTypes = {
    percent: PropTypes.func.isRequired,
    setActiveStepId: PropTypes.func.isRequired,
};

export default EscrowSetupView;
