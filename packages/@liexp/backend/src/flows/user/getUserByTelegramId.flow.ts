import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  AdminCreate,
  EventSuggestionEdit,
} from "@liexp/shared/lib/io/http/User.js";
import { type Option } from "fp-ts/lib/Option.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { Equal, Raw } from "typeorm";
import { type DatabaseContext } from "../../context/db.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type UserEntity } from "../../entities/User.entity.js";
import { type DBError } from "../../providers/orm/database.provider.js";
import { UserRepository } from "../../services/entity-repository.service.js";
import { LoggerService } from "../../services/logger/logger.service.js";

export const getUserByTelegramId = <C extends LoggerContext & DatabaseContext>(
  telegramId: string | number,
): ReaderTaskEither<C, DBError, Option<UserEntity>> => {
  return pipe(
    fp.RTE.ask<C>(),
    LoggerService.RTE.debug([`Find user by telegramId %s`, telegramId]),
    fp.RTE.chain(() => {
      return pipe(
        UserRepository.findOneOrFail<C>({
          where: [AdminCreate, EventSuggestionEdit, EventSuggestionEdit].map(
            (permission) => ({
              telegramId: Equal(telegramId.toString()),
              permissions: Raw(
                (alias) => `(${alias})::jsonb ? '${permission.literals[0]}'`,
              ),
            }),
          ),
        }),
      );
    }),
    fp.RTE.map(fp.O.fromNullable),
  );
};
