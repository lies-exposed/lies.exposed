import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import {
  AdminCreate,
  EventSuggestionEdit,
  type User,
} from "@liexp/shared/lib/io/http/User.js";
import { type Option } from "fp-ts/lib/Option.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type APIContext } from "../../context/api.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { LoggerService } from "../../services/logger/logger.service.js";

export const getUserByTelegramId = <C extends LoggerContext & APIContext>(
  telegramId: string | number,
): ReaderTaskEither<C, APIError, Option<User>> => {
  return pipe(
    fp.RTE.ask<C>(),
    LoggerService.RTE.debug([`Find user by telegramId %s`, telegramId]),
    fp.RTE.chain(() => (ctx) => {
      return pipe(
        ctx.api.Endpoints.User.getList({
          filter: {
            telegramId: telegramId.toString(),
            permissions: [
              AdminCreate.value,
              EventSuggestionEdit.value,
              EventSuggestionEdit.value,
            ],
          },
        }),
        fp.TE.map((users) => users.data[0]),
      );
    }),
    fp.RTE.map(fp.O.fromNullable),
  );
};
