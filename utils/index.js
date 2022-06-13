import jwt from "jsonwebtoken";
export const fetcher = (...args) => fetch(...args).then((res) => res.json());
export const checkToken = (token) => {
    let payload;
    try {
        payload = jwt.verify(token, process.env.USER_KEY);
    } catch (err) {
        return false;
    }
    if (payload.expired < Date.now() && payload.userkey === process.env.USER_KEY) {
        return false;
    }
    return true;
};

// 根据ip查询地址
export const getAddressByIp = async (ip) => {
    const res = await fetcher(`http://ip-api.com/json/${ip}?lang=zh-CN`);
    return res.country + " " + res.regionName + " " + res.city;
};
export const BASE_REQUEST_PATH = process.env.NEXT_PUBLIC_VERCEL_URL
  ? process.env.NEXT_PUBLIC_VERCEL_URL.startsWith("http") ? process.env.NEXT_PUBLIC_VERCEL_URL : `http://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : `http://localhost:${process.env.PORT}`;
