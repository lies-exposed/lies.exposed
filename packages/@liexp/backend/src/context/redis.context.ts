import { type Redis } from "ioredis";

export interface RedisContext {
  redis: Redis;
}
