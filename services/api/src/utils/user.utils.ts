import { User } from "@liexp/shared/io/http";
import * as E from "fp-ts/lib/Either";
import * as IOE from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/function";
import { ControllerError, NotAuthorizedError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import { decodeUserFromHeaders } from "./authenticationHandler";

export const ensureUserExists = (
  u?: Express.User
): E.Either<ControllerError, User.User> => {
  return pipe(
    User.User.decode(u),
    E.mapLeft((e) => NotAuthorizedError())
  );
};

export const getUser = (ctx: RouteContext) => (req: Express.Request) =>
  pipe(
    decodeUserFromHeaders(ctx)(req.headers, []),
    IOE.fold(
      () => () => null,
      (u) => () => u
    )
  )();
