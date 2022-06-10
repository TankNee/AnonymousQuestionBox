import { DBQuery, Question, Settings } from "../../../utils/db";
import { sendMail } from "../../../utils/mailer";

export default async function handler(req, res) {
    const { content } = req.query;
    // 记录请求者的 ip
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    // 记录请求者的 user-agent
    const userAgent = req.headers["user-agent"];
    // 记录请求者的 referer
    const referer = req.headers["referer"];

    const question = new Question();
    question.set("content", content);
    question.set("ip", ip);
    question.set("userAgent", userAgent);
    question.set("referer", referer);
    
    const query = new DBQuery(Settings);
    const settings = await query.first();
    question
        .save()
        .then((question) => {
            if (settings) {
                sendMail(content.replace(/\n/g, "<br>"), settings.get("infoEmail"));
            }
            res.status(200).json(question.toJSON());
        })
        .catch((error) => {
            res.status(500).json(error);
        });
}
