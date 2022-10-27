import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { ControllerError, NotAuthorizedError, toControllerError } from "@io/ControllerError";

export const validateUser = (
  u?: Express.User
): E.Either<ControllerError, Express.User> => {
  return pipe(u, E.fromNullable(toControllerError(NotAuthorizedError())));
};
