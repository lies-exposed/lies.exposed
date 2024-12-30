import { type APIContext } from "@liexp/backend/lib/context/api.context.js";
import { type DatabaseContext } from "@liexp/backend/lib/context/db.context.js";
import { type TGBotProviderContext } from "@liexp/backend/lib/context/index.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { getUserByTelegramId } from "@liexp/backend/lib/flows/user/getUserByTelegramId.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type User } from "@liexp/shared/lib/io/http/User.js";
import { toControllerError } from "#io/ControllerError.js";
import { type TEControllerError } from "#types/TEControllerError.js";

export const findUserOrReplyFlow =
  <
    C extends TGBotProviderContext &
      LoggerContext &
      DatabaseContext &
      APIContext,
  >(
    ctx: C,
  ) =>
  (task: (u: User) => TEControllerError<void>) =>
  (chatId: number, userId?: number): TEControllerError<void> => {
    const checkUserIdExists = pipe(
      userId ? getUserByTelegramId(userId)(ctx) : fp.TE.right(fp.O.none),
      fp.TE.mapLeft(toControllerError),
    );

    return pipe(
      checkUserIdExists,
      fp.TE.chain((userOpt) => {
        ctx.logger.debug.log(`User found %O?`, userOpt);
        if (fp.O.isNone(userOpt)) {
          return pipe(
            fp.TE.tryCatch(
              () =>
                ctx.tg.api.sendMessage(
                  chatId,
                  `You are not allowed to create actors`,
                ),
              toControllerError,
            ),
            fp.TE.map(() => undefined),
          );
        }

        return pipe(task(userOpt.value));
      }),
    );
  };
