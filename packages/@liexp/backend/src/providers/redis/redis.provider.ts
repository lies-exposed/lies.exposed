import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type Redis } from "ioredis";
import { type RedisError, toRedisError } from "./redis.error.js";

interface RedisClientContext {
  client: () => Redis;
  connect: boolean;
}

export interface RedisClient {
  client: Redis;
  get: (key: string) => TaskEither<RedisError, string | null>;
  set: (key: string, value: string) => TaskEither<RedisError, "OK">;
}

export const GetRedisClient = ({
  ...ctx
}: RedisClientContext): TaskEither<RedisError, RedisClient> =>
  fp.TE.tryCatch(async () => {
    const redis = ctx.client();

    if (ctx.connect) {
      await redis.connect();
    }

    return {
      client: redis,
      set: (key, value) =>
        pipe(fp.TE.tryCatch(() => redis.set(key, value), toRedisError)),
      get: (key) => pipe(fp.TE.tryCatch(() => redis.get(key), toRedisError)),
    };
  }, toRedisError);
