import {
  type NotAuthorizedError,
  toNotAuthorizedError,
} from "@liexp/backend/lib/errors/NotAuthorizedError.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { User } from "@liexp/shared/lib/io/http/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";

export const ensureUserExists = (
  u?: Express.User,
): E.Either<NotAuthorizedError, User.User> => {
  return pipe(
    Schema.decodeUnknownEither(User.User)(u),
    E.mapLeft((e) => toNotAuthorizedError()),
  );
};
