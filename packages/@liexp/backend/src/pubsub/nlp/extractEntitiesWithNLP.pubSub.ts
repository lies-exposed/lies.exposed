import { ExtractEntitiesWithNLPInput } from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const ExtractEntitiesWithNLP = RedisPubSub(
  "nlp:extract-entities",
  ExtractEntitiesWithNLPInput,
);
