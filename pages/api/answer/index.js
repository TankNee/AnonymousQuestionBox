import { checkToken } from "../../../utils";
import { Answer, DBQuery } from "../../../utils/db";

export default async function handler(req, res) {
    const { content, id } = req.query;
    const { token } = req.headers;
    if (!checkToken(token)) {
        res.status(401).json({
            msg: "请先登录",
        });
        return;
    }
    const query = new DBQuery(Answer);
    query.equalTo("questionId", id);
    let answer = await query.first();
    if (!answer) {
        answer = new Answer();
    }
    answer.set("content", content);
    answer.set("questionId", id);
    answer
        .save()
        .then((answer) => {
            res.status(200).json(answer.toJSON());
        })
        .catch((error) => {
            res.status(500).json(error);
        });
}
