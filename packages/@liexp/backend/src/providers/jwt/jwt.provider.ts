import type * as logger from "@liexp/core/lib/logger/index.js";
import { User } from "@liexp/shared/lib/io/http/User.js";
import { fromValidationErrors } from "@liexp/shared/lib/providers/http/http.provider.js";
import * as IO from "fp-ts/lib/IO.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import { pipe } from "fp-ts/lib/function.js";
import jwt from "jsonwebtoken";
import { IOError } from "ts-io-error";

export class JWTError extends IOError {}

export const toError =
  (l: logger.Logger) =>
  (override?: Partial<JWTError>) =>
  (e: unknown): JWTError => {
    l.error.log("An error occurred %O", e);
    if (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        return {
          status: override?.status ?? 401,
          name: "JWTClient",
          message: e.message,
          details: {
            kind: "ClientError",
            status: "401",
            meta: [e.stack],
          },
        };
      }
    }

    return {
      status: override?.status ?? 401,
      name: "JWTClient",
      message: "An error occurred",
      details: {
        kind: "ClientError",
        status: "500",
        meta: [String(e)],
      },
    };
  };

export interface JWTProvider {
  signUser: (user: User) => IO.IO<string>;
  verifyUser: (string: string) => IOE.IOEither<JWTError, User>;
}

export interface JWTClientContext {
  secret: string;
  logger: logger.Logger;
}

export const GetJWTProvider = (ctx: JWTClientContext): JWTProvider => {
  return {
    signUser: (user: User) => {
      // ctx.logger.debug.log("Signing payload %O", user);
      return IO.of(jwt.sign(JSON.stringify(user), ctx.secret));
    },
    verifyUser: (token: string) => {
      const tk = token.replace("Bearer ", "");
      // ctx.logger.debug.log("Verifying token %s", tk);
      return pipe(
        IOE.tryCatch(() => jwt.verify(tk, ctx.secret), toError(ctx.logger)({})),
        IOE.chain((result) =>
          pipe(
            IOE.fromEither(fromValidationErrors(User.decode(result))),
            IOE.mapLeft(toError(ctx.logger)({})),
          ),
        ),
      );
    },
  };
};
