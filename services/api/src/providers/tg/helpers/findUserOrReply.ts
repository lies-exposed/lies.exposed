import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import type * as TE from "fp-ts/TaskEither";
import { type UserEntity } from "#entities/User.entity.js";
import { getUserByTelegramId } from "#flows/users/getUserByTelegramId.flow.js";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

export const findUserOrReplyFlow =
  (ctx: RouteContext) =>
  (te: (u: UserEntity) => TE.TaskEither<ControllerError, void>) =>
  (chatId: number, userId?: number): TE.TaskEither<ControllerError, void> => {
    const checkUserIdExists = pipe(
      userId ? getUserByTelegramId(ctx)(userId) : fp.TE.right(fp.O.none),
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
