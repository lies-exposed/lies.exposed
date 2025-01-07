import { CreateSocialPost } from "@liexp/shared/lib/io/http/SocialPost.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { RedisPubSub } from "../providers/redis/redis.provider.js";

export const PostToSocialPlatformsPubSub = RedisPubSub(
  "post-social-post",
  t.intersection([t.strict({ id: UUID }), CreateSocialPost]),
);
