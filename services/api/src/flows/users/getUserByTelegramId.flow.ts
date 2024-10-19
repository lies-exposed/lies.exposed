import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  AdminCreate,
  EventSuggestionEdit,
} from "@liexp/shared/lib/io/http/User.js";
import { type Option } from "fp-ts/lib/Option.js";
import { UserEntity } from "#entities/User.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { type RouteContext } from "#routes/route.types.js";
import { DBService } from "#services/db.service.js";

export const getUserByTelegramId = (
  telegramId: string | number,
): TEReader<Option<UserEntity>> => {
  return pipe(
    fp.RTE.ask<RouteContext>(),
    LoggerService.RTE.debug([`Find user by telegramId %s`, telegramId]),
    fp.RTE.chain(() => {
      return DBService.execQuery((em) =>
        em
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
      );
    }),
    fp.RTE.map(fp.O.fromNullable),
  );
};
