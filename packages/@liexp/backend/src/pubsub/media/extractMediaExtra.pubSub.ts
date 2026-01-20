import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const ExtractMediaExtraPubSub = RedisPubSub(
  "media:extract-media-extra",
  Schema.decodeUnknownEither(Schema.Struct({ id: UUID })),
);
