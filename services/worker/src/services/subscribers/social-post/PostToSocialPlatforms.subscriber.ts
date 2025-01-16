import { Subscriber } from "@liexp/backend/lib/providers/redis/Subscriber.js";
import { PostToSocialPlatformsPubSub } from "@liexp/backend/lib/pubsub/postToSocialPlatforms.pubSub.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { type RTE } from "../../../types.js";
import { postToSocialPlatforms } from "#flows/social-post/postToPlatforms.flow.js";

export const PostToSocialPlatformsSubscriber = Subscriber(
  PostToSocialPlatformsPubSub,
  (payload): RTE<void> =>
    pipe(
      postToSocialPlatforms(payload),
      fp.RTE.map(() => undefined),
    ),
);
