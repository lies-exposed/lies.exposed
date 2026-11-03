import path from "path";
import { createFromTGMessage } from "@liexp/backend/lib/flows/tg/createFromTGMessage.flow.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { pipe } from "fp-ts/lib/function.js";
import { actorCommand } from "./actor.command.js";
import { areaCommand } from "./area.command.js";
import { askCommand } from "./ask.command.js";
import { groupCommand } from "./group.command.js";
import { helpCommand } from "./help.command.js";
import { loginCommand } from "./login.command.js";
import { startCommand } from "./start.command.js";
import { type WorkerContext } from "#context/context.js";
import { getThanksMessage } from "#utils/tg.utils.js";

export const TGMessageCommands = (ctx: WorkerContext) => {
  const tgLogger = ctx.logger.extend("tg-bot"); // bind /start command to tg bot

  // bind /login $email $token command to tg bot
  loginCommand(ctx);
  // bind /start command to tg bot
  startCommand(ctx);
  // bind /help command to tg bot
  helpCommand(ctx);
  // bind /actor command to tg bot
  actorCommand(ctx);
  // bind /group command to tg bot
  groupCommand(ctx);
  // bind /area command to tg bot
  areaCommand(ctx);
  // bind /ask command to tg bot
  askCommand(ctx);

  ctx.tg.onMessage((msg) => {
    if (msg.text?.startsWith("/")) {
      ctx.logger.debug.log("Command message %s, skipping...", msg.text);
      return;
    }

    void pipe(
      sequenceS(fp.TE.ApplicativePar)({
        storeMsg: ctx.fs.writeObject(
          path.resolve(
            ctx.config.dirs.cwd,
            `temp/tg/messages/${msg.message_id}.json`,
          ),
          JSON.stringify(msg),
        ),
        eventSuggestion: createFromTGMessage(
          msg,
          {},
        )({ ...ctx, logger: tgLogger }),
      }),
      fp.TE.map(({ eventSuggestion }) => {
        tgLogger.info.log("Success %O", eventSuggestion);
        return getThanksMessage(eventSuggestion, ctx.env.WEB_URL);
      }),
      throwTE,
    )
      .then((message) =>
        pipe(
          ctx.tg.post(message, msg.message_id),
          throwTE,
        ),
      )
      .catch((e) => {
        tgLogger.error.log("Error %O", e);
        void pipe(
          ctx.tg.post(
            "Sorry, something went wrong while processing your message. Please try again later.",
            msg.message_id,
          ),
          fp.TE.mapLeft((err) => {
            tgLogger.error.log("Failed to send error reply: %O", err);
            return err;
          }),
          throwTE,
        ).catch(() => {
          /* silently ignore failure to send error reply */
        });
      });
  });
};
