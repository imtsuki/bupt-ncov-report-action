import TelegramBot from "node-telegram-bot-api";
import { ServerChanTurbo, PushDeer } from "push-all-in-one";

export function isPushServicesConfigured(): boolean {
    const chatId = process.env["TG_CHAT_ID"];
    const botToken = process.env["TG_BOT_TOKEN"];
    const sctKey = process.env["SERVERCHAN_KEY"];
    const pushDearPushKey = process.env["PUSHDEER_KEY"];

    const isTelegramBotConfigured = !!chatId && !!botToken;
    const isServerChanConfigured = !!sctKey;
    const isPushDearConfigured = !!pushDearPushKey;

    return isTelegramBotConfigured || isServerChanConfigured || isPushDearConfigured;
}
/**
 * 
 * @param title 推送标题
 * @param description 详细信息
 */
export async function pushNotification(title: string, description: string) {
    const chatId = process.env["TG_CHAT_ID"];
    const botToken = process.env["TG_BOT_TOKEN"];
    const sctKey = process.env["SERVERCHAN_KEY"];
    const pushDearPushKey = process.env["PUSHDEER_KEY"];
    const promises = [];

    title = `${title} [bupt-ncov-report-action]`;

    if (!!chatId && !!botToken) {
        const bot = new TelegramBot(botToken);
        const message = `*${title}*\n\n ${description}`;
        promises.push(bot.sendMessage(chatId, message, { parse_mode: "Markdown" }));
    }

    if (!!sctKey) {
        const serverChanTurbo = new ServerChanTurbo(sctKey);
        promises.push(serverChanTurbo.send(title, description));
    }

    if (!!pushDearPushKey) {
        const pushDeer = new PushDeer(pushDearPushKey);
        promises.push(pushDeer.send(title, description));
    }

    await Promise.all(promises);
}
