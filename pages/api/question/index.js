import { DBQuery, Question, Settings } from "../../../utils/db";
import { sendMail } from "../../../utils/mailer";

export default async function handler(req, res) {
    const { content } = req.query;
    const question = new Question();
    question.set("content", content);
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
