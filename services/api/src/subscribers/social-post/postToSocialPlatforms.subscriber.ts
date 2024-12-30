import {
  RedisPubSub,
  Subscriber,
} from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { CreateSocialPost } from "@liexp/shared/lib/io/http/SocialPost.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types";
import { postToSocialPlatforms } from "#flows/social-posts/postToPlatforms.flow.js";

const PostToSocialPlatformsSubscriber = Subscriber(
  "post-social-post",
  t.intersection([t.strict({ id: UUID }), CreateSocialPost]),
  (payload) =>
    pipe(
      postToSocialPlatforms(payload),
      fp.RTE.map(() => undefined),
    ),
);

export const PostToSocialPlatformsPubSub = RedisPubSub(
  PostToSocialPlatformsSubscriber,
);
