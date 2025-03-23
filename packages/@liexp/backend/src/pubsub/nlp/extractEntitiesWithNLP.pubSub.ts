import { ExtractEntitiesWithNLPInput } from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import { Schema } from "effect";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const ExtractEntitiesWithNLP = RedisPubSub(
  "nlp:extract-entities",
  Schema.decodeUnknownEither(ExtractEntitiesWithNLPInput),
);
