import { URL } from "@liexp/io/lib/http/Common/URL.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EventType } from "@liexp/io/lib/http/Events/EventType.js";
import { Schema } from "effect";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const CreateEventFromURLPubSub = RedisPubSub(
  "event:create-from-url",
  Schema.decodeUnknownEither(
    Schema.Struct({
      url: URL,
      type: EventType,
      eventId: UUID,
      userId: UUID,
    }),
  ),
);
