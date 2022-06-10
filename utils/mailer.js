import mailer from "nodemailer";

const account = process.env.MAILER_ACCOUNT;
const password = process.env.MAILER_PASSWORD;
const host = process.env.MAILER_HOST;
const transporter = mailer.createTransport({
    host,
    port: 465,
    secureConnection: true,
    // 我们需要登录到网页邮箱中，然后配置SMTP和POP3服务器的密码
    auth: {
        user: account,
        pass: password,
    },
});
var mailOptions = {
    // 发送邮件的地址
    from: account, // login user must equal to this user
    // 接收邮件的地址
    to: "", // xrj0830@gmail.com
    // 邮件主题
    subject: "提问箱收到了新问题",
    // 邮件内容
    html: "",
};
export const sendMail = (html, to, subject) => {
    mailOptions.html = `<html><p>${html}</p></html>`;
    mailOptions.to = to;
    mailOptions.subject = subject || mailOptions.subject;
    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            return console.error(error);
        }
        console.log("Message sent");
    });
};
