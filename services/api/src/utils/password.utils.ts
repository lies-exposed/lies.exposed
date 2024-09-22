import crypto from "crypto";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type ControllerError, ServerError } from "#io/ControllerError.js";

const toError = (e: unknown): ControllerError => {
  if (e instanceof Error) {
    return ServerError([e.name]);
  }
  return ServerError([e as any]);
};

/**
 * Hash the given password with crypto
 * @param password - the password to hash
 * @returns a {@link TE.TaskEither<ControllerError, string>} with the hashed password
 */
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

/**
 * Verify if the given password matches the hash
 * @param password - the password to verify
 * @param hash - the hash to compare
 * @returns a {@link TE.TaskEither<ControllerError, boolean>} with the result of the comparison
 */
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
