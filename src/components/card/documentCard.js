
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
    showSignButton = true,
    signButtonText = "E-Sign",
    signDisabled = false,
    showViewButton = true,
    statusColor,
    actionButtons = [],
}) {
    const isSigned = status === "SIGNED" || status === "COMPLETED";
    const resolvedStatusColor = statusColor || (isSigned ? "success" : status === "LOCKED" ? "default" : "warning");

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
                        color={resolvedStatusColor}
                    >
                        {status}
                    </Label>
                }

                {showViewButton && (
                    <Button
                        variant="outlined"
                        size="medium"
                        onClick={() => window.open(docLink, "_blank")}
                        disabled={!docLink}
                    >
                        VIEW
                    </Button>
                )}

                {showSignButton && !isSigned && (
                    <Button
                        variant="contained"
                        size="medium"
                        color="warning"
                        onClick={onSign}
                        disabled={signDisabled}
                    >
                        {signButtonText}
                    </Button>
                )}

                {actionButtons.map((action) => (
                    <Button
                        key={action.key || action.label}
                        variant={action.variant || "contained"}
                        size={action.size || "medium"}
                        color={action.color || "warning"}
                        onClick={action.onClick}
                        disabled={action.disabled}
                    >
                        {action.label}
                    </Button>
                ))}
            </Box>
        </Card>
    );
}
