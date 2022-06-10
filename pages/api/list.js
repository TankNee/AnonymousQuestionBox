import { checkToken } from "../../utils";
import { Answer, DBQuery, Question } from "../../utils/db";

export default async function handler(req, res) {
    const { token } = req.headers;
    const query = new DBQuery(Question);
    query.descending("createdAt");

    const questions = await query.find();
    const results = await Promise.all(
        questions.map((question) => {
            return new Promise((resolve, reject) => {
                const answerQuery = new DBQuery(Answer);
                answerQuery.equalTo("questionId", question.get("objectId"));
                answerQuery
                    .first()
                    .then((answer) => {
                        if (!answer) {
                            resolve({
                                ...question.toJSON(),
                                answer: null,
                            });
                        } else {
                            resolve({
                                ...question.toJSON(),
                                answer: answer.toJSON(),
                            });
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        })
    );

    const filteredResults = results.filter((result) => result.answer);
    if (!token || !checkToken(token)) {
        res.status(200).json(filteredResults);
    } else {
        res.status(200).json(results);
    }
}
