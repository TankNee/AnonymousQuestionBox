import { DBQuery, Settings } from "../../../utils/db";

export default async function handler(req, res) {
    const query = new DBQuery(Settings);
    let settings = await query.first();
    if (!settings) {
        settings = new Settings();
        settings.set("description", "这是一个简单的提问箱");
        settings.set("inboxName", "提问箱");
        settings.set("infoEmail", "");
        settings.set("ipInterceptCount", 3);
        settings.set("ipInterceptTime", 60); // 60 minutes
        await settings.save();
    }
    res.status(200).json(settings.toJSON());
}
