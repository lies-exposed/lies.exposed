import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const GenerateThumbnailPubSub = RedisPubSub(
  "media:generate-thumbnail",
  Schema.Struct({ id: UUID }),
);
