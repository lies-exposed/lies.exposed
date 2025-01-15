import { type Subscriber } from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type RTE } from "../../types.js";
import { CreateEventFromURLSubscriber } from "./event/createEventFromURL.subscriber.js";
import { ExtractMediaExtraSubscriber } from "./media/extractMediaExtra.subscriber.js";
import { GenerateThumbnailSubscriber } from "./media/generateThumbnail.subscriber.js";
import { TransferFromExternalProviderSubscriber } from "./media/transferFromExternalProvider.subscriber.js";
import { ExtractEntitiesWithNLPSubscriber } from "./nlp/extractEntitiesWithNLP.subscriber.js";
import { PostToSocialPlatformsSubscriber } from "./social-post/PostToSocialPlatforms.subscriber.js";
import { type WorkerContext } from "#context/context.js";
import { type WorkerError } from "#io/worker.error.js";

export const WorkerSubscribers: RTE<void> = (ctx) => {
  const subscribers: Subscriber<WorkerContext, any, string, WorkerError>[] = [
    // media
    GenerateThumbnailSubscriber,
    ExtractMediaExtraSubscriber,
    TransferFromExternalProviderSubscriber,
    // event
    CreateEventFromURLSubscriber,
    // social posts
    PostToSocialPlatformsSubscriber,
    // admin
    // nlp
    ExtractEntitiesWithNLPSubscriber,
  ];

  return pipe(
    subscribers,
    fp.A.traverse(fp.TE.ApplicativePar)((sub) => sub.subscribe()(ctx)),
    fp.TE.map(() => undefined),
  );
};
