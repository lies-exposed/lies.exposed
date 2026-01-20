import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const GenerateThumbnailPubSub = RedisPubSub(
  "media:generate-thumbnail",
  Schema.decodeUnknownEither(Schema.Struct({ id: UUID })),
);
