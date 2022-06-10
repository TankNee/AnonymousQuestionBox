// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { DBQuery, Settings } from "../../utils/db";

export default function handler(req, res) {
    const query = new DBQuery(Settings);
    query.first().then((settings) => {
        res.status(200).json(settings.toJSON());
    });
}
