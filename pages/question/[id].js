import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import styles from "../../styles/Home.module.css";
import Image from "next/image";
import useSWR from "swr";
import Head from "next/head";
import { fetcher } from "../../utils";

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
        duration: theme.transitions.duration.shortest,
    }),
}));

export default function QuestionCard(props) {
    const { question } = props;
    const router = useRouter();
    const { id } = router.query;
    const [expanded, setExpanded] = useState(true);
    const [logged, setLogged] = useState(false);
    const [answer, setAnswer] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarHint, setSnackbarHint] = useState("");
    const [token, setToken] = useState("");

    const { data: originalAnswer } = useSWR(`/api/answer/${id}`, fetcher);

    useEffect(() => {
        if (localStorage.getItem("logged") === "true") {
            setLogged(true);
        }
        if (localStorage.getItem("token")) {
            setToken(localStorage.getItem("token"));
        }
    }, [logged, token]);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleSaveAnswer = async () => {
        await fetcher(`/api/answer?id=${encodeURIComponent(id)}&content=${encodeURIComponent(answer)}`, {
            headers: {
                token,
            },
        });
        setSnackbarHint("提交成功");
        setSnackbarOpen(true);
        router.back();
    };

    const handleDeleteQuestion = async () => {
        await fetcher(`/api/question/delete?id=${encodeURIComponent(id)}`, {
            headers: {
                token,
            },
        });
        setSnackbarHint("删除成功");
        setSnackbarOpen(true);
        router.back();
    };

    const handleHideQuestion = async () => {};

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <div className={styles.container}>
            <Head>
                <meta name="description" content="Self-hosted anonymous inbox" />
                <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <Card sx={{ maxWidth: 400, width: "100%" }}>
                    <CardHeader subheader={new Date(question?.createdAt).toLocaleString()} />
                    <CardContent>
                        <Typography variant="h6" color="text.secondary">
                            {question.content.split("\n").map((item, index) => (
                                <>
                                    <span key={`content_${index}`}>{item}</span>
                                    <br key={`content_br_${index}`} />
                                </>
                            ))}
                        </Typography>
                    </CardContent>
                    <CardActions disableSpacing>
                        <IconButton aria-label="back-to-list" onClick={() => router.back()}>
                            <ArrowBackIcon />
                        </IconButton>
                        <ExpandMore expand={expanded} onClick={handleExpandClick} aria-expanded={expanded} aria-label="comment">
                            {expanded ? <ExpandLessOutlinedIcon /> : <AddCommentOutlinedIcon />}
                        </ExpandMore>
                    </CardActions>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        {logged ? (
                            <>
                                <CardContent>
                                    <TextField
                                        fullWidth
                                        onInput={(e) => {
                                            setAnswer(e.target.value);
                                        }}
                                        rows={4}
                                        multiline
                                        autoFocus
                                        margin="dense"
                                        id="answer"
                                        label="回答"
                                        variant="outlined"
                                        defaultValue={originalAnswer?.content}
                                    />
                                </CardContent>
                                <CardActions disableSpacing>
                                    {logged && (
                                        <>
                                            <Button size="small" onClick={handleDeleteQuestion}>
                                                删除问题
                                            </Button>
                                            {/* <Button size="small" onClick={handleSaveAnswer}>
                                                隐藏问题
                                            </Button> */}
                                        </>
                                    )}
                                    <Button style={{ marginLeft: "auto" }} size="small" onClick={handleSaveAnswer}>
                                        回答
                                    </Button>
                                </CardActions>
                            </>
                        ) : (
                            <CardContent>
                                <Typography variant="body1" color="text.secondary">
                                    {originalAnswer?.content}
                                </Typography>
                            </CardContent>
                        )}
                    </Collapse>
                </Card>

                <Snackbar onClose={handleSnackbarClose} autoHideDuration={2000} anchorOrigin={{ vertical: "top", horizontal: "center" }} open={snackbarOpen}>
                    <Alert sx={{ width: "100%" }} severity="success">
                        {snackbarHint}
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
export async function getServerSideProps(context) {
    const basePath = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : `http://localhost:${process.env.PORT}`;
    const { id } = context.query;
    const question = await fetcher(`${basePath}/api/question/${id}`);
    return {
        props: {
            question,
        },
    };
}
