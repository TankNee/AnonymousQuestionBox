import { Answer, DBQuery } from "../../../utils/db";

export default async function handler(req, res) {
    const { id } = req.query;
    if (id === 'undefined') {
        res.status(201).json({
            msg: "等待重新请求",
        });
        return;
    }
    const query = new DBQuery(Answer);
    query.equalTo("questionId", id);
    let answer = await query.first();
    answer = answer ? answer.toJSON() : '';
    res.status(200).json(answer);
}
