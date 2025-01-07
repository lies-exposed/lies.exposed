import path from "path";
import { createFromTGMessage } from "@liexp/backend/lib/flows/tg/createFromTGMessage.flow.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { pipe } from "fp-ts/lib/function.js";
import { actorCommand } from "./actor.command.js";
import { areaCommand } from "./area.command.js";
import { groupCommand } from "./group.command.js";
import { helpCommand } from "./help.command.js";
import { loginCommand } from "./login.command.js";
import { startCommand } from "./start.command.js";
import { type ServerContext } from "#context/context.type.js";
import { GetWriteJSON } from "#utils/json.utils.js";
import { getThanksMessage } from "#utils/tg.utils.js";

export const TGMessageCommands = (ctx: ServerContext) => {
  // const mediaPath = path.resolve(__dirname, "../data");
  // app.use(express.static(mediaPath));
  const tgLogger = ctx.logger.extend("tg-bot"); // bind /start command to tg bot

  const messageStore = GetWriteJSON(ctx.logger);

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

  ctx.tg.onMessage((msg, metadata) => {
    if (msg.text?.startsWith("/")) {
      ctx.logger.debug.log("Command message %s, skipping...", msg.text);
      return;
    }

    void pipe(
      sequenceS(fp.TE.ApplicativePar)({
        storeMsg: messageStore(
          path.resolve(
            ctx.config.dirs.cwd,
            `temp/tg/messages/${msg.message_id}.json`,
          ),
        )(msg),
        eventSuggestion: createFromTGMessage(
          msg,
          metadata,
        )({ ...ctx, logger: tgLogger }),
      }),
      fp.TE.map(({ eventSuggestion }) => {
        tgLogger.info.log("Success %O", eventSuggestion);
        return getThanksMessage(eventSuggestion, ctx.env.WEB_URL);
      }),
      throwTE,
    )
      .then((message) =>
        ctx.tg.api.sendMessage(msg.chat.id, message, {
          reply_to_message_id: msg.message_id,
        }),
      )
      .catch((e) => {
        tgLogger.error.log("Error %O", e);
      });
  });
};
