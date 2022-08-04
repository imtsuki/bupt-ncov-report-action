//import TelegramBot
import TelegramBot from "node-telegram-bot-api";
import { ServerChanTurbo, PushDeer } from "push-all-in-one";

export async function sleep(ms: number): Promise<void> {
    console.log(`Sleep for ${ms}ms...`);
    await new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomBetween(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
/**
 * 
 * @param title 推送标题
 * @param desp 详细信息
 * @returns true: 推送成功，false: 推送失败
 */
export async function pushNotice(title: string, desp: string): Promise<boolean> {
    const chatId = process.env["TG_CHAT_ID"];
    const botToken = process.env["TG_BOT_TOKEN"];
    const serverChanBotApiKey = process.env["SERVERCHAN_KEY"];
    const pushDearPushKey = process.env["PUSHDEER_KEY"];
    if (!!chatId && !!botToken) {
        const bot = new TelegramBot(botToken);
        await bot.sendMessage(chatId, title+'\n'+desp, {
            parse_mode: "Markdown",
        });
    }
    if (!!serverChanBotApiKey) {
        const serverChanTurbo = new ServerChanTurbo(serverChanBotApiKey);
        serverChanTurbo.send(title, desp);
    }
    if (!!pushDearPushKey) {
        const pushDeer = new PushDeer(pushDearPushKey);
        pushDeer.send(title, desp, "text");
    } else {
        console.log(title+"\n"+desp);
        return false;
    }
    return true;
}
