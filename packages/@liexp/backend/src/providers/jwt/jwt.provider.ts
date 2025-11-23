import type * as logger from "@liexp/core/lib/logger/index.js";
import { type UserEncoded } from "@liexp/shared/lib/io/http/User.js";
import { AuthUser } from "@liexp/shared/lib/io/http/auth/AuthUser.js";
import { ServiceClient } from "@liexp/shared/lib/io/http/auth/service-client/ServiceClient.js";
import { fromValidationErrors } from "@liexp/shared/lib/providers/http/http.provider.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as IO from "fp-ts/lib/IO.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import { pipe } from "fp-ts/lib/function.js";
import jwt from "jsonwebtoken";

export class JWTError extends IOError {
  name = "JWTError";
}

export const toError =
  (override?: Partial<JWTError>) =>
  (e: unknown): JWTError => {
    if (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        return new JWTError(e.message, {
          kind: "ClientError",
          status: (override?.status ?? 401) + "",
          meta: e.stack?.split("\n"),
        });
      }
    }

    return new JWTError("A JWT error occurred", {
      status: (override?.status ?? 401) + "",
      kind: "ClientError",
      meta: [String(e)],
    });
  };

export interface JWTProvider {
  signUser: (user: UserEncoded) => IO.IO<string>;
  signClient: (client: ServiceClient) => IO.IO<string>;
  verifyUser: (string: string) => IOE.IOEither<JWTError, AuthUser>;
  verifyClient: (string: string) => IOE.IOEither<JWTError, ServiceClient>;
}

export interface JWTClientContext {
  secret: string;
  logger: logger.Logger;
}

export const GetJWTProvider = (ctx: JWTClientContext): JWTProvider => {
  return {
    signUser: (user: UserEncoded) => {
      // ctx.logger.debug.log("Signing payload %O", user);
      return IO.of(
        jwt.sign(user, ctx.secret, {
          expiresIn: 10 * 24 * 60 * 60,
        }),
      );
    },
    signClient: (client: typeof ServiceClient.Type) => {
      // ctx.logger.debug.log("Signing service client payload %O", client);
      return IO.of(
        jwt.sign(client, ctx.secret, {
          expiresIn: 365 * 24 * 60 * 60, // Service clients get longer expiry (1 year)
        }),
      );
    },
    verifyUser: (token: string) => {
      const tk = token.replace("Bearer ", "");
      // ctx.logger.debug.log("Verifying token %s", tk);
      return pipe(
        IOE.tryCatch(() => jwt.verify(tk, ctx.secret), toError({})),
        IOE.chain((result) => {
          return pipe(
            IOE.fromEither(
              fromValidationErrors(
                Schema.decodeUnknownEither(AuthUser)(result),
              ),
            ),
            IOE.mapLeft(toError({})),
          );
        }),
      );
    },
    verifyClient: (token: string) => {
      const tk = token.replace("Bearer ", "");
      // ctx.logger.debug.log("Verifying token %s", tk);
      return pipe(
        IOE.tryCatch(() => jwt.verify(tk, ctx.secret), toError({})),
        IOE.chain((result) => {
          return pipe(
            IOE.fromEither(
              fromValidationErrors(
                Schema.decodeUnknownEither(ServiceClient)(result),
              ),
            ),
            IOE.mapLeft(toError({})),
          );
        }),
      );
    },
  };
};
