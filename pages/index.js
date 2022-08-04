import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import useSWR from "swr";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";

import { BASE_REQUEST_PATH, fetcher } from "../utils";
import QuestionDialog from "../components/QuestionDialog";
import Button from "@mui/material/Button";
import LoginDialog from "../components/LoginDialog";
import { useRouter } from "next/router";
import Container from "../components/Container";

export default function Home(props) {
    const { settings } = props;
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [logged, setLogged] = useState(false);
    const [token, setToken] = useState("");
    const [openLogin, setOpenLogin] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const { data: questions } = useSWR(["/api/list", { headers: { token } }], fetcher);

    useEffect(() => {
        if (localStorage.getItem("logged") === "true") {
            setLogged(true);
            setToken(localStorage.getItem("token"));
        }
    }, [logged]);

    const handleSubmitQuestion = async (content) => {
        const res = await fetcher(`/api/question?content=${encodeURIComponent(content)}`);
        if (res.code === 0) {
            setSnackbarMessage(res.msg);
            setSnackbarOpen(true);
        }
    };

    const handleSubmitUserKey = async (content) => {
        const res = await fetcher(`/api/auth?userkey=${encodeURIComponent(content)}`);
        if (res.code === 0) {
            localStorage.setItem("token", res.token);
            localStorage.setItem("logged", "true");
            setLogged(true);
            setToken(res.token);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleTitleClick = () => {
        if (!logged) {
            setOpenLogin(true);
        } else {
            localStorage.removeItem("logged");
            localStorage.removeItem("token");
            setLogged(false);
            setToken("");
        }
    };
    return (
        <Container title={settings?.inboxName}>
            <h1 onClick={handleTitleClick} className={styles.title}>
                {settings?.inboxName}
            </h1>

            <Alert className={styles.description} severity="info">
                <strong>{settings?.description}</strong>
            </Alert>
            <div className={styles.buttonBar}>
                <Button onClick={() => setOpen(true)} sx={{ maxWidth: 400, width: logged ? "50%" : "100%" }} variant="contained">
                    提问
                </Button>
                {logged && (
                    <Button onClick={() => router.push(`/settings?token=${token}`)} sx={{ maxWidth: 400, width: "50%" }} variant="contained">
                        设置
                    </Button>
                )}
            </div>

            <div className={styles.grid}>
                {!questions ? (
                    <CircularProgress />
                ) : (
                    questions.map((question, idx) => {
                        return (
                            <a href={`/question/${question.objectId}`} key={`question_${question.objectId}`} className={styles.card}>
                                <h2>
                                    {question.content.split("\n").map((item, index, arr) => (
                                        <div key={`content_${idx}_${index}`}>
                                            <span>{item}</span>
                                            {(index !== arr.length - 1 || index > 0) && <br />}
                                        </div>
                                    ))}
                                    &rarr;
                                </h2>
                                <h4>{new Date(question.createdAt).toLocaleDateString()}</h4>
                                <p>{question.answer?.content}</p>
                            </a>
                        );
                    })
                )}
            </div>
            <QuestionDialog onSubmit={handleSubmitQuestion} open={open} onClose={() => setOpen(false)} />
            <LoginDialog onSubmit={handleSubmitUserKey} open={openLogin} onClose={() => setOpenLogin(false)} />
            <Snackbar onClose={handleSnackbarClose} autoHideDuration={3000} anchorOrigin={{ vertical: "top", horizontal: "center" }} open={snackbarOpen}>
                <Alert sx={{ width: "100%" }} severity="info">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export async function getServerSideProps() {
    const settings = await fetcher(`${BASE_REQUEST_PATH}/api/settings`);
    return {
        props: {
            settings,
        },
    };
}
