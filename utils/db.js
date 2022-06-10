import AV from "leancloud-storage";

AV.init({
    appId: process.env.LEANCLOUD_APP_ID,
    appKey: process.env.LEANCLOUD_APP_KEY,
    serverURL: process.env.LEANCLOUD_SERVER_URL,
});

export const Question = AV.Object.extend("Question");

export const Settings = AV.Object.extend("Settings");

export const Answer = AV.Object.extend("Answer");

export const DBQuery = AV.Query;


