import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { type Message } from "node-telegram-bot-api";
import { type WorkerContext } from "#context/context.js";

export const startCommand = ({
  tg,
  env,
  ..._rest
}: WorkerContext): TGBotProvider => {
  tg.onText(/\/start/, (msg: Message, _match: RegExpExecArray | null) => {
    void tg.post(
      `Hello, I'm the bot for ${env.TG_BOT_CHAT}.\n\nI can create links, actors, groups and other thing for you.\n\nDiscover what I can do with the /help command`,
      msg.message_id,
    );
  });
  return tg;
};
