import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { CreateSocialPost } from "@liexp/shared/lib/io/http/SocialPost.js";
import { Schema } from "effect";
import { RedisPubSub } from "../providers/redis/RedisPubSub.js";

export const PostToSocialPlatformsPubSub = RedisPubSub(
  "post-social-post",
  Schema.decodeUnknownEither(
    Schema.Struct({ ...CreateSocialPost.fields, id: UUID }),
  ),
);
