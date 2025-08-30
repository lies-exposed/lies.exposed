import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
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
