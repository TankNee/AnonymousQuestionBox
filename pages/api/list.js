import { checkToken } from "../../utils";
import { Answer, DBQuery, Question } from "../../utils/db";

export default async function handler(req, res) {
    const { token } = req.headers;
    const query = new DBQuery(Question);
    query.descending("createdAt");

    const questions = await query.find();
    const answerQuery = new DBQuery(Answer);
    const questionIds = questions.map((q) => q.id);
    answerQuery.containedIn("questionId", questionIds);
    answerQuery.descending("createdAt");
    const answers = await answerQuery.find();

    const results = questions.map((q) => {
        const answer = answers.find((a) => a.get("questionId") === q.id);
        return {
            ...q.toJSON(),
            answer: answer ? answer.toJSON() : null,
        };
    });

    const filteredResults = results.filter((result) => result.answer);
    let ret;
    if (!token || !checkToken(token)) {
        ret = filteredResults;
    } else {
        ret = results;
    }
    ret = ret.map((q) => {
        delete q.ip;
        delete q.address;
        delete q.userAgent;
        delete q.referer;
        return q;
    });
    res.status(200).json(ret);
}
