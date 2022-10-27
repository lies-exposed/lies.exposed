import * as E from "fp-ts/lib/Either";
import * as IOE from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/function";
import { decodeUserFromHeaders } from "./authenticationHandler";
import {
  ControllerError,
  NotAuthorizedError
} from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

export const ensureUserExists = (
  u?: Express.User
): E.Either<ControllerError, Express.User> => {
  return pipe(u, E.fromNullable(NotAuthorizedError()));
};

export const getUser = (ctx: RouteContext) => (req: Express.Request) =>
  pipe(
    decodeUserFromHeaders(ctx)(req.headers, []),
    IOE.fold(
      () => () => null,
      (u) => () => u
    )
  )();
