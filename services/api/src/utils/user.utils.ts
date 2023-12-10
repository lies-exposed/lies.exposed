import { pipe } from "@liexp/core/lib/fp/index.js";
import { User } from "@liexp/shared/lib/io/http/index.js";
import * as E from "fp-ts/lib/Either.js";
import {
  NotAuthorizedError,
  type ControllerError,
} from "#io/ControllerError.js";

export const ensureUserExists = (
  u?: Express.User,
): E.Either<ControllerError, User.User> => {
  return pipe(
    User.User.decode(u),
    E.mapLeft((e) => NotAuthorizedError()),
  );
};
