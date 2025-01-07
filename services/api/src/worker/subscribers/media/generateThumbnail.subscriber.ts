import { generateThumbnailFlow } from "@liexp/backend/lib/flows/media/thumbnails/generateThumbnails.flow.js";
import { Subscriber } from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { GenerateThumbnailPubSub } from "@liexp/backend/lib/pubsub/media/generateThumbnail.pubSub.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";

export const GenerateThumbnailSubscriber = Subscriber(
  GenerateThumbnailPubSub,
  (payload) =>
    pipe(
      generateThumbnailFlow(payload),
      fp.RTE.map(() => undefined),
    ),
);
