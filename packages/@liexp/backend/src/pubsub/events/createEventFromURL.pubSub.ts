import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as t from "io-ts";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const CreateEventFromURLPubSub = RedisPubSub(
  "event:create-from-url",
  Schema.Struct({
    url: URL,
    type: EventType,
    eventId: UUID,
    userId: UUID,
  }),
);
