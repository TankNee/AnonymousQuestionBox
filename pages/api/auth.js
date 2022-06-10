import jwt from "jsonwebtoken";
export default function handler(req, res) {
    const { userkey } = req.query;
    if (userkey === process.env.USER_KEY) {
        const token = jwt.sign(
            {
                userkey,
                expired: Date.now() + 1000 * 60 * 60 * 24 * 7,
            },
            process.env.USER_KEY
        );
        res.status(200).json({
            token,
            code: 0,
        });
    } else {
        res.status(401).json({
            msg: "密码错误",
            code: 1
        });
    }
}
