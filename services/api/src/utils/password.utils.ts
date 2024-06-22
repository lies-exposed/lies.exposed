import crypto from "crypto";
import * as TE from "fp-ts/TaskEither";
import { type ControllerError, ServerError } from "#io/ControllerError.js";

const toError = (e: unknown): ControllerError => {
  if (e instanceof Error) {
    return ServerError([e.name]);
  }
  return ServerError([e as any]);
};

export function hash(password: string): TE.TaskEither<ControllerError, string> {
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
): TE.TaskEither<ControllerError, boolean> {
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
