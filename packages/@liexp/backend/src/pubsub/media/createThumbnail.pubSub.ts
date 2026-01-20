import { URL } from "@liexp/io/lib/http/Common/URL.js";
import { Media } from "@liexp/io/lib/http/Media/index.js";
import { Schema } from "effect";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

const { id, type } = Media.fields;

export const CreateMediaThumbnailPubSub = RedisPubSub(
  "media:create-thumbnail",
  Schema.decodeUnknownEither(
    Schema.Struct({
      id,
      location: URL,
      thumbnail: Schema.Union(URL, Schema.Null),
      type,
    }),
  ),
);
