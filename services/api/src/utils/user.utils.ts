import { User } from "@liexp/shared/lib/io/http";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { NotAuthorizedError, type ControllerError } from "@io/ControllerError";

export const ensureUserExists = (
  u?: Express.User,
): E.Either<ControllerError, User.User> => {
  return pipe(
    User.User.decode(u),
    E.mapLeft((e) => NotAuthorizedError()),
  );
};