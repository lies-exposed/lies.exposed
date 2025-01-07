import { Media } from "@liexp/shared/lib/io/http/Media/index.js";
import * as t from "io-ts";
import { RedisPubSub } from "../../providers/redis/redis.provider.js";

const { id, location, thumbnail, type } = Media.type.props;

export const CreateMediaThumbnailPubSub = RedisPubSub(
  "media:create-thumbnail",
  t.strict({
    id,
    location,
    thumbnail,
    type,
  }),
);
