import { type BotBrotherCtx } from "bot-brother";
import { type RouteContext } from "@routes/route.types";

export const helpCommand = ({
  logger,
  wp,
  tg,
  db,
  ...rest
}: RouteContext): BotBrotherCtx => {
  // tg.bot.api.setMyCommands([{
  //   command: 'actor',
  //   description: 'Create new actor'
  // }])

  tg.bot.command("help").invoke((ctx) => {
    logger.debug.log("help command");
    return ctx.sendMessage(`
/actors [fullName]      Create new actor
/groups [name]           Create new group
    `);
  });
  return tg.bot;
};
