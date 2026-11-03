import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError } from "#io/worker.error.js";
import { type Message } from "node-telegram-bot-api";

export const loginCommand = ({
  logger,
  wp: _wp,
  tg,
  db,
  env: _env,
  ..._restCtx
}: WorkerContext): TGBotProvider => {
  tg.onText(/\/login\s(.*)/, (msg: Message, match) => {
    logger.debug.log(`Login with %O`, match);
    const userId = msg.from?.id;
    if (!userId || !match || match[1] === "") {
      return;
    }

    logger.debug.log(`Match %O`, match);

    const [email, token] = match[1].split(" ");
    const commandContext = {
      email: email.trim(),
      token: token.trim(),
    };

    logger.debug.log("Looking for actor %s", commandContext.email);

    void pipe(
      db.findOne(UserEntity, {
        where: {
          email: commandContext.email,
        },
      }),
      fp.TE.chain((a) => {
        if (fp.O.isSome(a)) {
          const telegramTokenMatch =
            a.value.telegramToken === commandContext.token;
          if (telegramTokenMatch) {
            return pipe(
              db.update(UserEntity, a.value.id, { telegramId: userId + "" }),
              fp.TE.chain(() =>
                pipe(
                  tg.post(
                    `User ${commandContext.email} linked to TG user ${userId}`,
                    msg.message_id,
                  ),
                  fp.TE.mapLeft((e) => toWorkerError(e)),
                  fp.TE.map(() => undefined),
                ),
              ),
            );
          }

          return pipe(
            tg.post(
              `Invalid token for user ${commandContext.email}`,
              msg.message_id,
            ),
            fp.TE.mapLeft((e) => toWorkerError(e)),
            fp.TE.map(() => undefined),
          );
        }

        return pipe(
          tg.post(
            `User ${commandContext.email} not found`,
            msg.message_id,
          ),
          fp.TE.mapLeft((e) => toWorkerError(e)),
          fp.TE.map(() => undefined),
        );
      }),
      throwTE,
    );
  });

  return tg;
};
