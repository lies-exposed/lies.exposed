import {
  type DatabaseContext,
  type LoggerContext,
  type TGBotProviderContext,
} from "@liexp/backend/lib/context/index.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UserEntity } from "#entities/User.entity.js";
import { getUserByTelegramId } from "#flows/users/getUserByTelegramId.flow.js";
import { toControllerError } from "#io/ControllerError.js";
import { type TEControllerError } from "#types/TEControllerError.js";

export const findUserOrReplyFlow =
  <C extends TGBotProviderContext & LoggerContext & DatabaseContext>(ctx: C) =>
  (te: (u: UserEntity) => TEControllerError<void>) =>
  (chatId: number, userId?: number): TEControllerError<void> => {
    const checkUserIdExists = pipe(
      userId ? getUserByTelegramId(userId)(ctx) : fp.TE.right(fp.O.none),
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

        return pipe(te(userOpt.value));
      }),
    );
  };
