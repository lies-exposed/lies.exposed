import { EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as t from "io-ts";
import { RedisPubSub } from "../../../providers/redis/redis.provider.js";

export const CreateScientificStudyFromURLPubSub = RedisPubSub(
  "scientific-study:create-from-url",
  t.strict({
    url: t.string,
    type: EventType,
  }),
);
