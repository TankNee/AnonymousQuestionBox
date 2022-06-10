import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";

export default function LoginDialog(props) {
    const { open, onClose, onSubmit } = props;
    const [content, setContent] = useState("");

    const handleSubmit = (...args) => {
        onSubmit(content);
        setContent("");
        onClose(...args);
    };

    const handleClose = (...args) => {
        onClose(...args);
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>身份验证</DialogTitle>
                <DialogContent>
                    <Alert severity="info">
                        <strong>
                            请输入您在启动时设置的密钥（USER_KEY）
                        </strong>
                    </Alert>
                    <TextField
                        fullWidth
                        value={content}
                        onInput={(e) => {
                            setContent(e.target.value);
                        }}
                        margin="dense"
                        id="content"
                        label="密钥"
                        variant="filled"
                        type="password"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button onClick={handleSubmit}>提交</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
