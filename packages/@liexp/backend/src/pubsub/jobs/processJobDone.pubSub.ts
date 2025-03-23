import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  QueueResourceNames,
  QueueTypes,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import { Schema } from "effect";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const ProcessJobDonePubSub = RedisPubSub(
  "job:process-done",
  Schema.decodeUnknownEither(
    Schema.Struct({
      id: UUID,
      type: QueueTypes,
      resource: QueueResourceNames,
    }),
  ),
);
