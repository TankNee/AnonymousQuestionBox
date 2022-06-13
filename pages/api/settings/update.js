import { DBQuery, Settings } from "../../../utils/db";

export default async function handler(req, res) {
    const query = new DBQuery(Settings);
    // 获取put请求的body内容
    const body = req.body;
    let settings = await query.first();
    settings.set(body);
    await settings.save();
    res.status(200).json(settings.toJSON());
}
