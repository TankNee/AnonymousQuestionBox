import { getAddressByIp } from "../../../utils";
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

    const questionQuery = new DBQuery(Question);

    const settingsQuery = new DBQuery(Settings);
    const settings = await settingsQuery.first();
    // 一个ip一个小时内最多发三条
    questionQuery.equalTo("ip", ip);
    questionQuery.greaterThan("createdAt", new Date(Date.now() - settings.get("ipInterceptTime") * 60 * 1000));
    const questionCount = await questionQuery.count();

    if (questionCount >= settings.get("ipInterceptCount")) {
        res.status(403).json({
            code: 1,
            msg: "提问已达上限",
        });
        return;
    }
    const addr = await getAddressByIp(ip);

    const question = new Question();
    question.set("content", content);
    question.set("ip", ip);
    question.set("address", addr);
    question.set("userAgent", userAgent);
    question.set("referer", referer);

    await question.save();
    if (settings.get("email")) {
        sendMail(content.replace(/\n/g, "<br>"), settings.get("infoEmail"));
    }
    res.status(200).json({
        code: 0,
        msg: "提问成功",
    });
}
