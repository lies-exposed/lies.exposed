import { IOError } from "@ts-endpoint/core";

export class RedisError extends IOError {
  name = "RedisError";
}

export const toRedisError = (e: unknown): RedisError => {
  if (e instanceof IOError) {
    return e as RedisError;
  }

  if (e instanceof Error) {
    return new RedisError(e.message, {
      kind: "ServerError",
      status: "500",
      meta: [e.name, e.stack],
    });
  }

  return new RedisError("An error occurred", {
    kind: "ServerError",
    status: "500",
    meta: [String(e)],
  });
};
