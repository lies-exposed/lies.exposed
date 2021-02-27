import { logger } from "@econnessione/core";
import { User } from "@econnessione/shared/io/http/User";
import * as IO from "fp-ts/lib/IO";
import * as IOE from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import jwt from "jsonwebtoken";

export interface JWTClient {
  signUser: (user: User) => IO.IO<string>;
  verifyUser: (string: string) => IOE.IOEither<t.Errors, User>;
}

interface JWTClientContext {
  secret: string;
  logger: logger.Logger;
}

export const GetJWTClient = (ctx: JWTClientContext): JWTClient => {
  return {
    signUser: (user: User) => {
      ctx.logger.debug.log("Signing payload %O", user);
      return IO.of(jwt.sign(JSON.stringify(user), ctx.secret));
    },
    verifyUser: (token: string) => {
      ctx.logger.debug.log("Verifying token %s", token);
      return pipe(
        IOE.right(jwt.verify(token, ctx.secret)),
        IOE.chain((result) => IOE.fromEither(User.decode(result)))
      );
    },
  };
};
