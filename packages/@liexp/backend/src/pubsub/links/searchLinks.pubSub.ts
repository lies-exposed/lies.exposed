import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { Schema } from "effect/index";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

export const SearchLinksPubSub = RedisPubSub(
  "link:search",
  Schema.encodeUnknownEither(
    Endpoints.Event.Custom.SearchEventsFromProvider.Input.Body,
  ),
);
