import * as t from "io-ts";
import { RedisPubSub } from "../../providers/redis/redis.provider.js";

export const CreateEntityStatsPubSub = RedisPubSub(
  "stats:create-entity",
  t.any,
);
