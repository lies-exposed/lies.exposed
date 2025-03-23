import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { Media } from "@liexp/shared/lib/io/http/Media/index.js";
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
