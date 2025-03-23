import { Schema } from "effect";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const CreateEntityStatsPubSub = RedisPubSub(
  "stats:create-entity",
  Schema.Struct({
    type: Schema.Union(
      Schema.Literal("keywords"),
      Schema.Literal("groups"),
      Schema.Literal("actors"),
    ),
    id: Schema.String,
  }),
);
