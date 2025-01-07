import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type TGBotProviderContext } from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type UserEntity } from "../../entities/User.entity.js";
import { getUserByTelegramId } from "../../flows/user/getUserByTelegramId.flow.js";
import {
  toDBError,
  type DBError,
} from "../../providers/orm/database.provider.js";

export const findUserOrReplyFlow =
  <C extends TGBotProviderContext & LoggerContext & DatabaseContext>(ctx: C) =>
  (task: (u: UserEntity) => TaskEither<DBError, void>) =>
  (chatId: number, userId?: number): TaskEither<DBError, void> => {
    const checkUserIdExists = pipe(
      userId ? getUserByTelegramId(userId)(ctx) : fp.TE.right(fp.O.none),
      fp.TE.mapLeft(toDBError()),
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
              toDBError(),
            ),
            fp.TE.map(() => undefined),
          );
        }

        return pipe(task(userOpt.value));
      }),
    );
  };
