import { UUID } from "@liexp/io/lib/http/Common/index.js";
import { Schema } from "effect/index";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const TakeLinkScreenshotPubSub = RedisPubSub(
  "link:take-screenshot",
  Schema.decodeUnknownEither(
    Schema.Struct({
      id: UUID,
    }),
  ),
);
