import { type Subscriber } from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ServerContext } from "../../context/context.type.js";
import { type TEReader } from "../../flows/flow.types.js";
import { type ControllerError } from "../../io/ControllerError.js";
import { ExtractMediaExtraSubscriber } from "./media/extractMediaExtra.subscriber.js";
import { GenerateThumbnailSubscriber } from "./media/generateThumbnail.subscriber.js";
import { PostToSocialPlatformsSubscriber } from "./social-post/postToSocialPlatforms.subscriber.js";

export const WorkerSubscribers: TEReader<void> = (ctx) => {
  const subscribers: Subscriber<ServerContext, any, string, ControllerError>[] =
    [
      // media
      GenerateThumbnailSubscriber,
      ExtractMediaExtraSubscriber,
      // social posts
      PostToSocialPlatformsSubscriber,
    ];

  return pipe(
    subscribers,
    fp.A.traverse(fp.TE.ApplicativePar)((sub) => sub.subscribe()(ctx)),
    fp.TE.map(() => undefined),
  );
};
