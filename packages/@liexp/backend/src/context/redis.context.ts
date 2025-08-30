import { type RedisClient } from "../providers/redis/redis.provider.js";

export interface RedisContext {
  redis: RedisClient;
}
