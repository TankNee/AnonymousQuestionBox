import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import styles from "../../styles/Home.module.css";
import Image from "next/image";
import Head from "next/head";
import { BASE_REQUEST_PATH, checkToken, fetcher } from "../../utils";
import Script from "next/script";
import { Alert, Backdrop, InputAdornment, Snackbar } from "@mui/material";
import Container from "../../components/Container";

export default function SettingsPage(props) {
    const { settings } = props;
    const { description, inboxName, infoEmail, ipInterceptCount, ipInterceptTime } = settings;
    const router = useRouter();

    const [descriptionValue, setDescriptionValue] = useState(description);
    const [inboxNameValue, setInboxNameValue] = useState(inboxName);
    const [infoEmailValue, setInfoEmailValue] = useState(infoEmail);
    const [ipInterceptCountValue, setIpInterceptCountValue] = useState(ipInterceptCount);
    const [ipInterceptTimeValue, setIpInterceptTimeValue] = useState(ipInterceptTime);
    // const [loading, setLoading] = useState(false);
    const [snackbarHint, setSnackbarHint] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("logged") !== "true") {
            router.push("/");
        }
    }, [router]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleSaveSettings = async () => {
        if (descriptionValue === "" || inboxNameValue === "" || infoEmailValue === "") {
            setSnackbarHint("请填写完整的设置");
            setSnackbarOpen(true);
            return;
        }
        
        if (ipInterceptCountValue <= 0 || ipInterceptTimeValue <= 0) {
            setSnackbarHint("请填写正确的防护设置");
            setSnackbarOpen(true);
            return;
        }

        const data = {
            description: descriptionValue,
            inboxName: inboxNameValue,
            infoEmail: infoEmailValue,
            ipInterceptCount: ipInterceptCountValue,
            ipInterceptTime: ipInterceptTimeValue,
        };
        const res = await fetcher("/api/settings/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                token: localStorage.getItem("token"),
            },
            body: JSON.stringify(data),
        });
    };

    return (
        <Container title="设置">
            <Card sx={{ maxWidth: 800, width: "100%" }}>
                <CardActions disableSpacing>
                    <IconButton aria-label="back-to-list" onClick={() => router.back()}>
                        <ArrowBackIcon />
                    </IconButton>
                    <h2>设置</h2>
                </CardActions>
                <CardContent className={styles.settingsForm}>
                    <TextField required onInput={(e) => setInboxNameValue(e.target.value)} label="提问箱标题" fullWidth value={inboxNameValue} />
                    <TextField required onInput={(e) => setDescriptionValue(e.target.value)} label="提问箱描述" fullWidth value={descriptionValue} />
                    <TextField required onInput={(e) => setInfoEmailValue(e.target.value)} label="联系邮箱" fullWidth value={infoEmailValue} />
                    <TextField
                        required
                        label="IP拦截次数"
                        fullWidth
                        value={ipInterceptCountValue}
                        onInput={(e) => setIpInterceptCountValue(Number(e.target.value))}
                        type="number"
                        InputProps={{
                            endAdornment: <InputAdornment position="end">次</InputAdornment>,
                        }}
                        helperText="每个IP在一定时间内可以提交的提问数量"
                    />
                    <TextField
                        required
                        label="IP拦截时间"
                        fullWidth
                        value={ipInterceptTimeValue}
                        onInput={(e) => setIpInterceptTimeValue(Number(e.target.value))}
                        type="number"
                        InputProps={{
                            endAdornment: <InputAdornment position="end">分钟</InputAdornment>,
                        }}
                        helperText="在多长时间内限制IP提问"
                    />
                    <Button onClick={handleSaveSettings} variant="contained">
                        保存设置
                    </Button>
                </CardContent>
            </Card>
            <Snackbar onClose={handleSnackbarClose} autoHideDuration={2000} anchorOrigin={{ vertical: "top", horizontal: "center" }} open={snackbarOpen}>
                <Alert sx={{ width: "100%" }} severity="warning">
                    {snackbarHint}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export async function getServerSideProps({ req, res }) {
    const settings = await fetcher(`${BASE_REQUEST_PATH}/api/settings`);
    const matches = /token=(.*)/g.exec(req.url);
    const token = matches[1];
    if (!checkToken(token)) {
        return { props: { settings: {} } };
    }
    return {
        props: {
            settings,
        },
    };
}
