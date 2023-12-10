import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { type RouteContext } from "#routes/route.types.js";

export const startCommand = ({
  logger,
  wp,
  tg,
  db,
  env,
  ...rest
}: RouteContext): TGBotProvider => {
  tg.api.onText(/\/start/, (msg, match) => {
    void tg.api.sendMessage(
      msg.chat.id,
      `Hello, I'm the bot for ${env.TG_BOT_CHAT}.\n\nI can create links, actors, groups and other thing for you.\n\nDiscover what I can do with the /help command`,
    );
  });
  return tg;
};
