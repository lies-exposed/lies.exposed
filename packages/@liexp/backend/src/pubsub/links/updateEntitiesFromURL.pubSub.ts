import { UUID } from "@liexp/io/lib/http/Common/index.js";
import {
  QueueResourceNames,
  QueueTypes,
} from "@liexp/io/lib/http/Queue/index.js";
import { Schema } from "effect/index";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const UpdateEntitiesFromURLPubSub = RedisPubSub(
  "link:update-entities-from-url",
  Schema.decodeUnknownEither(
    Schema.Struct({
      id: UUID,
      type: QueueTypes,
      resource: QueueResourceNames,
    }),
  ),
);
