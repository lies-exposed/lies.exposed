import { type Subscriber } from "@liexp/backend/lib/providers/redis/Subscriber.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type RTE } from "../../types.js";
import { CreateEventFromURLSubscriber } from "./event/createEventFromURL.subscriber.js";
import { CreateMediaThumbnailSubscriber } from "./media/createThumbnail.subscriber.js";
import { ExtractMediaExtraSubscriber } from "./media/extractMediaExtra.subscriber.js";
import { GenerateThumbnailSubscriber } from "./media/generateThumbnail.subscriber.js";
import { TransferFromExternalProviderSubscriber } from "./media/transferFromExternalProvider.subscriber.js";
import { ExtractEntitiesWithNLPSubscriber } from "./nlp/extractEntitiesWithNLP.subscriber.js";
import { ProcessJobDoneSubscriber } from "./queue/processOpenAIJobDone.subscriber.js";
import { SearchFromWikipediaSubscriber } from "./searchFromWikipedia.subscriber.js";
import { PostToSocialPlatformsSubscriber } from "./social-post/PostToSocialPlatforms.subscriber.js";
import { CreateEntityStatsSubscriber } from "./stats/CreateEntityStats.subscriber.js";
import { type WorkerContext } from "#context/context.js";
import { type WorkerError } from "#io/worker.error.js";

export const WorkerSubscribers: RTE<void> = (ctx) => {
  const subscribers: Subscriber<WorkerContext, any, string, WorkerError>[] = [
    // media
    GenerateThumbnailSubscriber,
    CreateMediaThumbnailSubscriber,
    ExtractMediaExtraSubscriber,
    TransferFromExternalProviderSubscriber,
    // event
    CreateEventFromURLSubscriber,
    // social posts
    PostToSocialPlatformsSubscriber,
    // admin
    // nlp
    ExtractEntitiesWithNLPSubscriber,
    // wikipedia
    SearchFromWikipediaSubscriber,
    // stats
    CreateEntityStatsSubscriber,
    // queue
    ProcessJobDoneSubscriber,
  ];

  return pipe(
    subscribers,
    fp.A.traverse(fp.TE.ApplicativePar)((sub) => sub.subscribe()(ctx)),
    fp.TE.map(() => undefined),
  );
};
