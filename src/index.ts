import got, { Got } from "got";
import { CookieJar } from "tough-cookie";
import { LoginForm, DailyReportForm } from "./form";
import * as core from "@actions/core";

const PREFIX = "https://app.bupt.edu.cn";
const LOGIN = "uc/wap/login/check";
const GET_REPORT = "ncov/wap/default/index"
const POST_REPORT = "ncov/wap/default/save";

async function login(client: Got, loginForm: LoginForm): Promise<void> {
    const response = await client.post(LOGIN, { form: loginForm });
    if (response.statusCode != 200) {
        core.setFailed("无法登录; 登陆请求没有返回 200");
    }
}

async function getFormData(client: Got): Promise<DailyReportForm> {
    const response = await client.get(GET_REPORT);
    if (response.body.indexOf("登录") != -1) {
        core.setFailed("登录失败: 请检查用户名与密码是否正确");
    }
    const newForm: DailyReportForm = JSON.parse(/var def = (\{.+\});/.exec(response.body)?.[1] ?? "");
    const oldForm: DailyReportForm = JSON.parse(/oldInfo: (\{.+\}),/.exec(response.body)?.[1] ?? "");
    Object.assign(oldForm, newForm);
    return oldForm;
}

async function postFormData(client: Got, formData: DailyReportForm): Promise<string> {
    const response = await client.post(POST_REPORT, { form: formData });
    return response.body;
}

(async (): Promise<void> => {
    const cookieJar = new CookieJar();
    const client = got.extend({
        prefixUrl: PREFIX,
        cookieJar
    });

    const loginForm: LoginForm = {
        username: process.env["BUPT_USERNAME"],
        password: process.env["BUPT_PASSWORD"]
    }

    if (loginForm.username == null || loginForm.password == null) {
        core.setFailed("无法登录；请在仓库 Settings 的 Secrets 栏填写 BUPT_USERNAME 与 BUPT_PASSWORD");
    }

    core.debug(`用户 ${loginForm.username} 登录中`);

    await login(client, loginForm);

    core.debug("正在获取前一天的疫情填报信息");

    const formData = await getFormData(client);

    core.debug("正在提交今日疫情填报信息");

    console.log(await postFormData(client, formData));

    core.debug("今日疫情填报成功！");
})();


