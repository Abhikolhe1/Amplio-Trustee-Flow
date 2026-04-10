import { Button, Card, Typography } from "@mui/material";
import { alpha, Box, Container, Stack } from "@mui/system";
import PropTypes from "prop-types";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import DocumentCard from "src/components/card/documentCard";
import { useEffect } from "react";

const DEFAULT_DOCUMENTS = [
    {
        id: 1,
        title: "Trust Deed",
        description:
            "Master fiduciary framework between Settlor, Trustee, and Beneficiaries",
        icon: "mdi:file-document-outline",
        docLink: "/assets/spv-Document/trust_deed.pdf",
        status: "PENDING",
    },
    {
        id: 5,
        title: "Escrow Agreement",
        description:
            "Account control terms, debit freeze conditions, and release triggers",
        icon: "mdi:file-document-outline",
        docLink: "/assets/spv-Document/escrow.pdf",
        status: "PENDING",
    },
    {
        id: 6,
        title: "Information Memorandum (IM)",
        description:
            "SEBI-mandated investor disclosure document with risk factors",
        icon: "mdi:file-document-outline",
        docLink: "/assets/spv-Document/im.pdf",
        status: "PENDING",
    },
];




function LegalDocument({ setActiveStepId, percent, currData, saveStepData }) {

    const LegalDocumentSchema = Yup.object().shape({
        documents: Yup.array().of(Yup.object().shape({ status: Yup.string().oneOf(["SIGNED"], "Document must be signed").required(), })).min(1),
    });

    const {
        handleSubmit,
        setValue,
        watch,
        reset,
        control,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(LegalDocumentSchema),
        defaultValues: {
            documents: []
        },
    });

    const formDocs = watch("documents");
     const formDocuments = useWatch({
        control,
        name: 'documents',
      }) || [];

    useEffect(() => {
        const currentDocuments = Array.isArray(currData)
            ? currData
            : Array.isArray(currData?.documents)
                ? currData.documents
                : [];

        const updatedDocs = DEFAULT_DOCUMENTS.map((doc) => {
            const existing = currentDocuments.find((d) => d.id === doc.id);

            return {
                ...doc,
                status: existing?.status || "PENDING",
            };
        });

        reset({ documents: updatedDocs });
    }, [currData, reset]);

    const onSubmit = (data) => {
        console.log("All signed:", data);
        saveStepData(data);
        setActiveStepId("credit_rating");
        
    };

     useEffect(() => {
       
        const requiredDocuments = formDocuments;
    
        const completedDocuments = requiredDocuments.filter(
          (doc) => doc.status === 'COMPLETED' || doc.status === 'SIGNED'
        ).length;
        const percentValue =
          requiredDocuments.length > 0 && Math.round((completedDocuments / requiredDocuments.length) * 100);
    
        percent?.(percentValue);
      }, [formDocuments, percent]);

    return (
        <Container>
            <Card>
                <Stack spacing={4} p={3}>
                    <Box>
                        <Typography variant="h4" color="primary" fontWeight={600}>
                            Legal Documents
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            All documents must be signed before proceeding.
                        </Typography>
                    </Box>


                    <Stack spacing={2}>
                        {formDocs.map((doc, index) => (
                            <DocumentCard
                                key={doc.id}
                                docLink={doc.docLink}
                                icon={doc.icon}
                                title={doc.title}
                                description={doc.description}
                                status={doc.status}
                                onSign={() =>
                                    setValue(`documents.${index}.status`, "SIGNED", {
                                        shouldValidate: true,
                                    })
                                }
                            />
                        ))}
                    </Stack>


                    {errors.documents && (
                        <Typography color="error">
                            Please sign all documents before proceeding
                        </Typography>
                    )}
                    <Box display="flex" justifyContent="flex-end">
                        <Button variant="contained" color="primary" onClick={handleSubmit(onSubmit)}>
                            Next
                        </Button>
                    </Box>
                </Stack>
            </Card>



        </Container>
    );
}

LegalDocument.propTypes = {

    currData: PropTypes.any,
    disabled: PropTypes.any,
    percent: PropTypes.func,
    saveStepData: PropTypes.func.isRequired,
    setActiveStepId: PropTypes.func.isRequired,

};

export default LegalDocument;
