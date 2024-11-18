import {
  type NotAuthorizedError,
  toNotAuthorizedError,
} from "@liexp/backend/lib/errors/NotAuthorizedError.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { User } from "@liexp/shared/lib/io/http/index.js";
import * as E from "fp-ts/lib/Either.js";

export const ensureUserExists = (
  u?: Express.User,
): E.Either<NotAuthorizedError, User.User> => {
  return pipe(
    User.User.decode(u),
    E.mapLeft((e) => toNotAuthorizedError()),
  );
};
