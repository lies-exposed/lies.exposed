import { createThumbnail } from "@liexp/backend/lib/flows/media/thumbnails/createThumbnail.flow.js";
import { Subscriber } from "@liexp/backend/lib/providers/redis/Subscriber.js";
import { CreateMediaThumbnailPubSub } from "@liexp/backend/lib/pubsub/media/createThumbnail.pubSub.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { type RTE } from "../../../types.js";

export const CreateMediaThumbnailSubscriber = Subscriber(
  CreateMediaThumbnailPubSub,
  (payload): RTE<void> =>
    pipe(
      createThumbnail(payload),
      fp.RTE.map(() => undefined),
    ),
);
