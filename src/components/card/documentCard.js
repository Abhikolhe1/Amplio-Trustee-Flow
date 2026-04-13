
import { Button, Card, Typography } from "@mui/material";
import { alpha, Box } from "@mui/system";
import Iconify from "src/components/iconify";
import Label from "src/components/label";

export default function DocumentCard({
    docLink,
    icon,
    title,
    description,
    status,
    onSign,
}) {
    const isSigned = status === "SIGNED" || status === "COMPLETED";

    return (
        <Card
            sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderRadius: 1,

                border: `2px solid ${isSigned
                        ? alpha(theme.palette.success.light, 0.5)
                        : alpha(theme.palette.warning.light, 0.5)
                    }`,

                backgroundColor: `${isSigned
                        ? alpha(theme.palette.success.light, 0.2)
                        : alpha(theme.palette.warning.light, 0.2)
                    }`,
            })}
        >
        
            <Box display="flex" alignItems="center" gap={2}>
                {icon && (
                    <Box
                        sx={(theme) => ({
                            width: 44,
                            height: 44,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",

                            border: `2px solid ${isSigned
                                    ? alpha(theme.palette.success.light, 0.5)
                                    : alpha(theme.palette.warning.light, 0.5)
                                }`,

                            backgroundColor: `${isSigned
                                    ? alpha(theme.palette.success.light, 0.2)
                                    : alpha(theme.palette.warning.light, 0.2)
                                }`,
                        })}
                    >
                        <Iconify icon={icon} width={22} color="info" />
                    </Box>
                )}

                <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                        {title}
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 0.3 }}>
                        {description}
                    </Typography>
                </Box>
            </Box>


            <Box display="flex" alignItems="center" gap={1.5}>
                {status &&
                    <Label
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: 12,
                            fontWeight: 600,
                        }}
                        color={isSigned ? "success" : "warning"}
                    >
                        {status}
                    </Label>
                }

                <Button
                    variant="outlined"
                    size="medium"
                    onClick={() => window.open(docLink, "_blank")}
                >
                    VIEW
                </Button>

                {!isSigned && (
                    <Button
                        variant="contained"
                        size="medium"
                        color="warning"
                        onClick={onSign}
                    >
                        E-Sign
                    </Button>
                )}
            </Box>
        </Card>
    );
}
