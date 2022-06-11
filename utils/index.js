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
    const res = await fetcher(`http://whois.pconline.com.cn/ipJson.jsp?ip=${ip}&json=true`);
    return res.addr;
};
