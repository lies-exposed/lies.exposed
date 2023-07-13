import { type BotBrotherCtx } from "bot-brother";
import { type RouteContext } from "@routes/route.types";

export const startCommand = ({
  logger,
  wp,
  tg,
  db,
  env,
  ...rest
}: RouteContext): BotBrotherCtx => {
  tg.bot.command("start").invoke((ctx) => {
    return ctx.sendMessage(
      `Hello, I'm the bot for ${env.TG_BOT_CHAT}.\n\nI can create links, actors, groups and other thing for you.\n\nDiscover what I can do with the /help command`,
    );
  });
  return tg.bot;
};
