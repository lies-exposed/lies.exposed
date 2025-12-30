import { type NotFoundError } from "@liexp/backend/lib/errors/NotFoundError.js";
import { type DBError } from "@liexp/backend/lib/providers/orm/database.provider.js";
import { type RedisError } from "@liexp/backend/lib/providers/redis/redis.error.js";
import { type SpaceError } from "@liexp/backend/lib/providers/space/space.provider.js";
import { type _DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { type HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";
import { type IOError } from "@ts-endpoint/core";

export type WorkerError =
  | HTTPError
  | NotFoundError
  | _DecodeError
  | SpaceError
  | RedisError
  | DBError
  | IOError;

export const toWorkerError = (e: unknown): WorkerError => {
  // If it's already one of our known error types, return it
  if (e instanceof Error && "status" in e && "details" in e) {
    return e as WorkerError;
  }

  // If it's a standard Error, convert it to IOError
  if (e instanceof Error) {
    return {
      name: "WorkerError",
      status: 500,
      message: e.message,
      details: {
        kind: "ServerError" as const,
        status: "500",
        meta: e.stack,
      },
    } as IOError;
  }

  // For unknown types, create a generic error
  return {
    name: "WorkerError",
    status: 500,
    message: "An unknown error occurred",
    details: {
      kind: "ServerError" as const,
      status: "500",
      meta: String(e),
    },
  } as IOError;
};

export const report = (e: WorkerError): string => {
  return `${e.name}: ${e.message}`;
};
