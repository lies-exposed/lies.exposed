import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { RedisPubSub } from "../../providers/redis/redis.provider.js";

export const GenerateThumbnailPubSub = RedisPubSub(
  "media:generate-thumbnail",
  t.strict({ id: UUID }),
);
