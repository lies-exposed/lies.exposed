import { ACTOR, GROUP } from "@liexp/io/lib/http/Common/index.js";
import { Schema } from "effect";
import { RedisPubSub } from "../providers/redis/RedisPubSub.js";

export const SearchFromWikipediaPubSub = RedisPubSub(
  "search:search-from-wikipedia",
  Schema.decodeUnknownEither(
    Schema.Struct({
      search: Schema.String,
      provider: Schema.String,
      type: Schema.Union(GROUP, ACTOR),
    }),
  ),
);
