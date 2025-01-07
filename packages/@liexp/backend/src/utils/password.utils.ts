import crypto from "crypto";
import * as TE from "fp-ts/lib/TaskEither.js";
import { ServerError } from "../errors/ServerError.js";

const toError = (e: unknown): ServerError => {
  if (e instanceof Error) {
    return ServerError.of([e.name]);
  }
  return ServerError.fromUnknown(e);
};

export function hash(password: string): TE.TaskEither<ServerError, string> {
  return TE.tryCatch(
    () =>
      new Promise((resolve, reject) => {
        // generate random 16 bytes long salt
        const salt = crypto.randomBytes(16).toString("hex");

        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
          if (err) reject(err);
          resolve(salt + ":" + derivedKey.toString("hex"));
        });
      }),
    toError,
  );
}

export function verify(
  password: string,
  hash: string,
): TE.TaskEither<ServerError, boolean> {
  return TE.tryCatch(
    () =>
      new Promise((resolve, reject) => {
        const [salt, key] = hash.split(":");
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
          if (err) reject(err);
          resolve(key === derivedKey.toString("hex"));
        });
      }),
    toError,
  );
}
