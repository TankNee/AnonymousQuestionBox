import { DBQuery } from "../../../utils/db";

export default async function handler(req, res) {
    const { id } = req.query;
    if (id === "undefined") {
        res.status(201).json({
            msg: "等待重新请求",
        });
        return;
    }
    const query = new DBQuery("Question");
    query.equalTo("objectId", id);
    const question = await query.first();
    if (!question) {
        res.status(405).json({
            msg: "问题不存在",
        });
        return;
    }
    res.status(200).json(question.toJSON());
}
