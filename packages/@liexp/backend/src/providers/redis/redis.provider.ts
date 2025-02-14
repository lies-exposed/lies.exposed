import { fp } from "@liexp/core/lib/fp/index.js";
import { Redis } from "ioredis";
import { toRedisError } from "./redis.error.js";

interface RedisClientContext {
  client: Redis;
  host: string;
  port: number;
  lazyConnect?: boolean;
}

export const RedisClient = (ctx: RedisClientContext) =>
  fp.TE.tryCatch(async () => {
    const redis = new Redis(6379, ctx.host, {
      lazyConnect: ctx.lazyConnect,
    });

    if (ctx.lazyConnect) {
      await redis.connect();
    }
    return redis;
  }, toRedisError);
