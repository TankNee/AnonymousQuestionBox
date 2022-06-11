import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import useSWR from "swr";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";

import { fetcher } from "../utils";
import QuestionDialog from "../components/QuestionDialog";
import Button from "@mui/material/Button";
import LoginDialog from "../components/LoginDialog";

export default function Home() {
    const [open, setOpen] = useState(false);
    const [logged, setLogged] = useState(false);
    const [token, setToken] = useState("");
    const [openLogin, setOpenLogin] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    // fetcher("/api/list", { headers: { token } }).then((data) => setQuestions(data));

    const { data: questions } = useSWR(["/api/list", { headers: { token } }], fetcher);

    const { data: settings } = useSWR("/api/settings", fetcher);

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
        <div className={styles.container}>
            <Head>
                <title>{settings?.inboxName}</title>
                <meta name="description" content="Self-hosted anonymous inbox" />
                <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
                <link rel="icon" href="/favicon.ico" />
                <script async defer data-website-id="ccaee418-93c4-44fb-90b6-f5c18bc0e3b7" src="https://dashboard.tanknee.cn/umami.js"></script>
            </Head>

            <main className={styles.main}>
                <h1 onClick={handleTitleClick} className={styles.title}>
                    Welcome to {settings?.inboxName}!
                </h1>

                <Alert className={styles.description} severity="info">
                    <strong>{settings?.description}</strong>
                </Alert>
                <div className={styles.buttonBar}>
                    <Button onClick={() => setOpen(true)} sx={{ maxWidth: 400, width: logged ? "50%" : "100%" }} variant="contained">
                        提问
                    </Button>
                    {logged && (
                        <Button onClick={() => setOpen(true)} sx={{ maxWidth: 400, width: "50%" }} variant="contained">
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
            </main>

            <footer className={styles.footer}>
                <a href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app" target="_blank" rel="noopener noreferrer">
                    Powered by {"TankNee"}
                    <span className={styles.logo}>
                        <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
                    </span>
                </a>
            </footer>
        </div>
    );
}

export async function getServerSideProps() {
    const basePath = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : `http://localhost:${process.env.PORT}`;
    const settings = await fetcher(`${basePath}/api/settings`);
    const questions = await fetcher(`${basePath}/api/list`);
    return {
        props: {
            settings,
            questions,
        },
    };
}
