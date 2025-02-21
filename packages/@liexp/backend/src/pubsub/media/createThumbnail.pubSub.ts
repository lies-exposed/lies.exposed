import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { Media } from "@liexp/shared/lib/io/http/Media/index.js";
import * as t from "io-ts";
import { RedisPubSub } from "../../providers/redis/RedisPubSub.js";

const { id, type } = Media.type.props;

export const CreateMediaThumbnailPubSub = RedisPubSub(
  "media:create-thumbnail",
  t.strict({
    id,
    location: URL,
    thumbnail: t.union([URL, t.null]),
    type,
  }),
);
