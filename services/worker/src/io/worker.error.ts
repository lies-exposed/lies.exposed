import { type NotFoundError } from "@liexp/backend/lib/errors/NotFoundError.js";
import { type IOError } from "@liexp/backend/lib/errors/index.js";
import { type DBError } from "@liexp/backend/lib/providers/orm/database.provider.js";
import { type RedisError } from "@liexp/backend/lib/providers/redis/redis.error.js";
import { type SpaceError } from "@liexp/backend/lib/providers/space/space.provider.js";
import { type _DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { type HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";

export type WorkerError =
  | HTTPError
  | NotFoundError
  | _DecodeError
  | SpaceError
  | RedisError
  | DBError
  | IOError;

export const toWorkerError = (e: unknown): WorkerError => {
  return e as any;
};

export const report = (e: WorkerError): string => {
  return `${e.name}: ${e.message}`;
};
