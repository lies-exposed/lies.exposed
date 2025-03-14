import { ACTOR, GROUP } from "@liexp/shared/lib/io/http/Common/index.js";
import * as t from "io-ts";
import { RedisPubSub } from "../providers/redis/RedisPubSub.js";

export const SearchFromWikipediaPubSub = RedisPubSub(
  "search:search-from-wikipedia",
  Schema.Struct({
    search: Schema.String,
    provider: Schema.String,
    type: Schema.Union([GROUP, ACTOR]),
  }),
);
