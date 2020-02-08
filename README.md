# bupt-ncov-report-action

使用 GitHub Actions 自动填报北邮 2019-nCoV 疫情信息。

这个 Action 会自动在北京时间的每天 8:00 AM 进行填报。

## 使用方法

首先，点击上方绿色的 **Use this template**，使用这个模板创建你自己的 Repository；

然后，在你自己仓库的 Settings 的 Secrets 中设置以下信息：

- `BUPT_USERNAME`: 你用来登录的学号；
- `BUPT_PASSWORD`: 你用来登录的密码。

## 检查结果

无需任何设置。如果运行失败，GitHub 会向你的邮箱发送一封邮件。

### Telegram Bot

如果你知道怎么使用 Telegram Bot，则可以额外设置如下的 Secrets 来用 Bot 给你发送结果：

- `TG_BOT_TOKEN`: 你的 Bot 的 Token；
- `TG_CHAT_ID`: 你和 Bot 的 Chat ID。
