import { User } from "@liexp/shared/lib/io/http";
import * as E from "fp-ts/lib/Either";
import * as IOE from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/function";
import { decodeUserFromRequest } from "./authenticationHandler";
import { type ControllerError, NotAuthorizedError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";

export const ensureUserExists = (
  u?: Express.User,
): E.Either<ControllerError, User.User> => {
  return pipe(
    User.User.decode(u),
    E.mapLeft((e) => NotAuthorizedError()),
  );
};

export const getUser = (ctx: RouteContext) => (req: Express.Request) =>
  pipe(
    decodeUserFromRequest(ctx)(req, []),
    IOE.fold(
      () => () => null,
      (u) => () => u,
    ),
  )();
