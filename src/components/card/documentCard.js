
import { Button, Card, Link, Typography } from "@mui/material";
import { alpha, Box } from "@mui/system";
import Iconify from "src/components/iconify";
import Label from "src/components/label";

export default function DocumentCard({ docLink, icon, title, description, status,button }) {
    return (<>
        <Card
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderRadius: 1,
                border: docLink ? (theme) => `solid 2px ${alpha(theme.palette.success.light, 0.5)}` : (theme) => `solid 2px ${alpha(theme.palette.error.light, 0.5)}`,
                backgroundColor: docLink ? (theme) => alpha(theme.palette.success.light, 0.2) : (theme) => alpha(theme.palette.error.light, 0.2),

            }}
        >
            <Box display="flex" alignItems="center" gap={2}>
                {icon &&
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: docLink ? (theme) => `solid 2px ${alpha(theme.palette.success.light, 0.5)}` : (theme) => `solid 2px ${alpha(theme.palette.error.light, 0.5)}`,
                            backgroundColor: docLink ? (theme) => alpha(theme.palette.success.light, 0.2) : (theme) => alpha(theme.palette.error.light, 0.2),
                        }}
                    >
                        <Iconify icon={icon} width={22} color="info" />
                    </Box>
                }

                <Box>
                    {title &&
                        <Typography variant="subtitle1" fontWeight={600}>
                            {title}
                        </Typography>}
                    {description &&
                        <Typography variant="body2" sx={{ mt: 0.3 }}
                        >
                            {description}
                        </Typography>}
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
                        color={docLink ? "success" : "error"}
                    >
                        {status}
                    </Label>}
                {button &&
                <Button
                    variant="outlined"
                    size="medium"
                    color={docLink ? "success" : "primary"}
                    onClick={() => {
                        if (docLink) {
                            window.open(docLink, "_blank");
                        } else {

                        }
                    }}
                >
                    {button ? button : docLink ? "VIEW" : "GENERATE" }
                </Button>
                }
            </Box>
        </Card>
    </>)
}