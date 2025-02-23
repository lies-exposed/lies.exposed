import * as t from "io-ts";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const CreateEntityStatsPubSub = RedisPubSub(
  "stats:create-entity",
  t.strict({
    type: t.union([
      t.literal("keywords"),
      t.literal("groups"),
      t.literal("actors"),
    ]),
    id: t.string,
  }),
);
