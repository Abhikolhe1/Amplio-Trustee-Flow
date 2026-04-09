import { Button, Card, Link, Typography } from "@mui/material";
import { alpha, Box, color, Container, Stack } from "@mui/system";
import PropTypes from "prop-types";
import DocumentCard from "src/components/card/documentCard";
import Iconify from "src/components/iconify";
import Label from "src/components/label";



function LegalDocument({ setActiveStepId, percent }) {
     
    const documents = [
        {
            id: 1,
            title: "Trust Deed",
            description:
                "Master fiduciary framework between Settlor, Trustee, and Beneficiaries · 14 pages",
            status: "SIGNED",
            type: "primary",
            icon: "mdi:file-document-outline",
            docLink: '/assets/spv-Document/trust_deed.pdf',
            button: "View"
        },

        {
            id: 5,
            title: "Escrow Agreement",
            description:
                "Specific account control terms, debit freeze conditions, and release triggers between Trustee and Axis Bank",
            status: "REQUIRED",
            type: "warning",
            icon: "mdi:file-document-outline",
            button: "Generate"
        },
        {
            id: 6,
            title: "Information Memorandum (IM)",
            description:
                "SEBI-mandated investor disclosure document. Includes risk factors, yield projections, pool composition · Required before ISIN",
            status: "REQUIRED",
            type: "error",
            icon: "mdi:file-document-outline",
            button: "Generate"
        },

    ];
    const handelNext = () => {
        console.log("hiiii");
      setActiveStepId('credit_rating');
       percent(100);

    }

    return (
        <Container>
            <Stack spacing={4}>
                <Box display="flex" alignItems="center" gap={2}>

                    <Box>
                        <Typography variant="h4" color="primary" fontWeight={600}>
                            Legal Documents
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Generate, review, and execute all 3 required legal instruments. All documents must reach Signed or Generated status before proceeding.
                        </Typography>
                    </Box>
                </Box>

                <Stack spacing={2}>
                    {documents.map((doc) => (
                        <DocumentCard button={doc.button} docLink={doc.docLink} icon={doc.icon} title={doc.title} status={doc.status} description={doc.description} />
                    ))}
                </Stack>
                <Box sx={{ display: "flex", justifyContent: "flex-end", alignContent: "center", gap: 2 }}>
                    <Button  variant="contained" color="primary" onClick={ ()=>handelNext()}>Next</Button>
                </Box>
            </Stack>
        </Container>
    )

}
LegalDocument.propTypes = {
    // currData: PropTypes.any,
    // disabled: PropTypes.any,
    percent: PropTypes.func,
   // saveStepData: PropTypes.func.isRequired,
    setActiveStepId: PropTypes.func.isRequired,
};
export default LegalDocument;