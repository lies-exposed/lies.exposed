import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const ExtractMediaExtraPubSub = RedisPubSub(
  "media:extract-media-extra",
  t.strict({ id: UUID }),
);
