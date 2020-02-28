import * as core from "@actions/core";
import got, { Got } from "got";
import { CookieJar } from "tough-cookie";
import { LoginForm, DailyReportForm, DailyReportResponse } from "./form";


const PREFIX_URL = "https://app.bupt.edu.cn";
const LOGIN = "uc/wap/login/check";
const GET_REPORT = "ncov/wap/default/index";
const POST_REPORT = "ncov/wap/default/save";
const RETRY = 5;

async function login(
    loginForm: LoginForm
): Promise<Got> {
    const cookieJar = new CookieJar();
    const client = got.extend({
        prefixUrl: PREFIX_URL,
        cookieJar,
        retry: RETRY
    });

    const response = await client.post(LOGIN, { form: loginForm });
    if (response.statusCode != 200) {
        throw new Error(`login 请求返回了 ${response.statusCode}`);
    }

    return client;
}

async function getDailyReportFormData(
    client: Got
): Promise<DailyReportForm> {
    const response = await client.get(GET_REPORT);
    if (response.statusCode != 200) {
        throw new Error(`getFormData 请求返回了 ${response.statusCode}`);
    }
    if (response.body.indexOf("登录") != -1) {
        throw new Error("登录失败；请检查用户名与密码是否正确");
    }
    const newForm: DailyReportForm = JSON.parse(
        /var def = (\{.+\});/.exec(response.body)?.[1] ?? ""
    );
    const oldForm: DailyReportForm = JSON.parse(
        /oldInfo: (\{.+\}),/.exec(response.body)?.[1] ?? ""
    );

    if (oldForm.geo_api_info === undefined) {
        throw new Error("昨天的信息不完整；请手动填报一天后继续使用本脚本");
    }

    const geo = JSON.parse(oldForm.geo_api_info);

    // 前一天的地址
    const province = geo.addressComponent.province;
    let city = geo.addressComponent.city;
    if (geo.addressComponent.city.trim() === "" && ["北京市", "上海市", "重庆市", "天津市"].indexOf(province) > -1) {
        city = geo.addressComponent.province;
    } else {
        city = geo.addressComponent.city;
    }
    const area = geo.addressComponent.province + " "
        + geo.addressComponent.city + " "
        + geo.addressComponent.district;
    const address = geo.formattedAddress;

    Object.assign(oldForm, newForm);

    delete oldForm.jrdqtlqk;
    delete oldForm.jrdqjcqk;

    // 覆盖昨天的地址
    oldForm.province = province;
    oldForm.city = city;
    oldForm.area = area;
    oldForm.address = address;

    // 强制覆盖一些字段
    // 是否移动了位置？否
    oldForm.ismoved = "0";
    // 不在同城原因？空
    oldForm.bztcyy = "";
    // 是否省份不合？否
    oldForm.sfsfbh = "0";

    return oldForm;
}

async function postDailyReportFormData(
    client: Got,
    formData: DailyReportForm
): Promise<DailyReportResponse> {
    const response = await client.post(POST_REPORT, { form: formData });
    if (response.statusCode != 200) {
        throw new Error(`postFormData 请求返回了 ${response.statusCode}`);
    }
    return JSON.parse(response.body);
}

(async (): Promise<void> => {
    const loginForm: LoginForm = {
        username: process.env["BUPT_USERNAME"],
        password: process.env["BUPT_PASSWORD"]
    }

    if (!(!!loginForm.username && !!loginForm.password)) {
        throw new Error("无法登录；请在仓库 Settings 的 Secrets 栏填写 BUPT_USERNAME 与 BUPT_PASSWORD");
    }

    core.debug("用户登录中");

    const client = await login(loginForm);

    core.debug("正在获取前一天的疫情填报信息");

    const formData = await getDailyReportFormData(client);

    core.debug("正在提交今日疫情填报信息");

    const reportReponse = await postDailyReportFormData(client, formData);

    console.log(`今日填报结果：${reportReponse.m}`);

    const telegramChatId = process.env["TG_CHAT_ID"];
    const telegramBotToken = process.env["TG_BOT_TOKEN"];

    if (!!telegramChatId && !!telegramBotToken) {
        const response = await got.post(
            `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
            {
                json: {
                    "chat_id": telegramChatId,
                    "text": `今日填报结果：${reportReponse.m}`,
                    "parse_mode": "HTML"
                }
            }
        );

        const body = JSON.parse(response.body);

        if (!body.ok) {
            throw new Error(`Telegram Bot 信息发送失败，返回：${body}`);
        }
    }
})().catch(err => {
    if (err instanceof Error) {
        console.log(err.stack);
        core.setFailed(err.message);
    }
});
