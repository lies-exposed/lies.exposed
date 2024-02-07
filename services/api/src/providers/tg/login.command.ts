import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { UserEntity } from "#entities/User.entity.js";
import { toControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

export const loginCommand = ({
  logger,
  wp,
  tg,
  db,
  env,
  ...restCtx
}: RouteContext): TGBotProvider => {
  tg.api.onText(/\/login\s(.*)/, (msg, match) => {
    logger.debug.log(`Login with %O`, match);
    const userId = msg.from?.id;
    if (!userId || !match || match[1] === "") {
      return;
    }

    logger.debug.log(`Match %O`, match);

    const [email, token] = match[1].split(" ");
    const commandContext: any = {
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
              fp.TE.chain(() => {
                return fp.TE.tryCatch(
                  () =>
                    tg.api.sendMessage(
                      msg.chat.id,
                      `User ${commandContext.email} linked to TG user ${userId}`,
                    ),
                  toControllerError,
                );
              }),
            );
          }

          return fp.TE.tryCatch(
            () =>
              tg.api.sendMessage(
                msg.chat.id,
                `Invalid token for user ${commandContext.email}`,
                {
                  reply_to_message_id: msg.message_id,
                },
              ),
            toControllerError,
          );
        }

        return fp.TE.tryCatch(
          () =>
            tg.api.sendMessage(
              msg.chat.id,
              `User ${commandContext.email} not found`,
              {
                reply_to_message_id: msg.message_id,
              },
            ),
          toControllerError,
        );
      }),
      throwTE,
    );
  });

  return tg;
};
