import { type NotAuthorizedError } from "@liexp/backend/lib/errors/NotAuthorizedError.js";
import { User } from "@liexp/shared/lib/io/http/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { toControllerError } from "../io/ControllerError.js";

export const ensureUserExists = (
  u?: Express.User,
): E.Either<NotAuthorizedError, User.User> => {
  if (Schema.is(User.User)(u)) {
    return E.right(u);
  }

  return E.left(toControllerError("User doesn't exists"));
};
