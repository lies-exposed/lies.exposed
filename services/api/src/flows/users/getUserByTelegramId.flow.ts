import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  AdminCreate,
  EventSuggestionEdit,
} from "@liexp/shared/lib/io/http/User.js";
import { type Option } from "fp-ts/lib/Option.js";
import { UserEntity } from "#entities/User.entity.js";
import { type TEFlow } from "#flows/flow.types.js";

export const getUserByTelegramId: TEFlow<
  [string | number],
  Option<UserEntity>
> = (ctx) => (telegramId) => {
  ctx.logger.debug.log(`Find user by telegramId %s`, telegramId);
  return pipe(
    ctx.db.execQuery(() =>
      ctx.db.manager
        .createQueryBuilder(UserEntity, "u")
        .where("u.telegramId = :telegramId", {
          telegramId: telegramId.toString(),
        })
        .andWhere(`u.permissions::jsonb ?| ARRAY[:...perms]`, {
          perms: [
            AdminCreate.value,
            EventSuggestionEdit.value,
            EventSuggestionEdit.value,
          ],
        })
        .getOne(),
    ),
    fp.TE.map(fp.O.fromNullable),
  );
};
