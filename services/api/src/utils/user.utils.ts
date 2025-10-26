import { type NotAuthorizedError } from "@liexp/backend/lib/errors/NotAuthorizedError.js";
import { AuthUser } from "@liexp/shared/lib/io/http/auth/AuthUser.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { toControllerError } from "../io/ControllerError.js";

export const ensureUserExists = (
  u?: AuthUser,
): E.Either<NotAuthorizedError, AuthUser> => {
  if (Schema.is(AuthUser)(u)) {
    return E.right(u);
  }

  return E.left(toControllerError("User doesn't exists"));
};
