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
import Script from "next/script";
import Container from "../../components/Container";

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
    const router = useRouter();
    const { id } = props;
    const [expanded, setExpanded] = useState(true);
    const [logged, setLogged] = useState(false);
    const [answer, setAnswer] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarHint, setSnackbarHint] = useState("");
    const [token, setToken] = useState("");

    const { data: question } = useSWR(`/api/question/${id}`, fetcher);

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

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container title="问题详情">
            {!question ? (
                <CircularProgress />
            ) : (
                <Card sx={{ maxWidth: 400, width: "100%" }}>
                    <CardHeader subheader={new Date(question?.createdAt).toLocaleString()} />
                    <CardContent>
                        <Typography variant="h5" color="text.header">
                            {question?.content?.split("\n").map((item, index) => (
                                <div key={`question_content_${index}`}>
                                    <span>{item}</span>
                                    <br />
                                </div>
                            ))}
                        </Typography>
                    </CardContent>
                    <CardActions disableSpacing>
                        <IconButton aria-label="back-to-list" onClick={() => router.push("/")}>
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
                                    {originalAnswer?.content?.split("\n").map((item, index) => (
                                        <div key={`answer_content_${index}`}>
                                            <span>{item}</span>
                                            <br />
                                        </div>
                                    ))}
                                </Typography>
                            </CardContent>
                        )}
                    </Collapse>
                </Card>
            )}

            <Snackbar onClose={handleSnackbarClose} autoHideDuration={2000} anchorOrigin={{ vertical: "top", horizontal: "center" }} open={snackbarOpen}>
                <Alert sx={{ width: "100%" }} severity="success">
                    {snackbarHint}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export async function getServerSideProps({ params }) {
    return {
        props: {
            id: params.id,
        },
    };
}
