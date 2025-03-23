import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { Schema } from "effect";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const ExtractMediaExtraPubSub = RedisPubSub(
  "media:extract-media-extra",
  Schema.decodeUnknownEither(Schema.Struct({ id: UUID })),
);
