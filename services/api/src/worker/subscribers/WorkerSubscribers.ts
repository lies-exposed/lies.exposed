import { type RedisPubSub } from "@liexp/backend/lib/providers/redis/redis.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { GenerateThumbnailPubSub } from "../../subscribers/media/generateThumbnail.subscriber.js";
import { PostToSocialPlatformsPubSub } from "../../subscribers/social-post/postToSocialPlatforms.subscriber.js";
import { type ServerContext } from "#context/context.type.js";
import { type TEReader } from "#flows/flow.types.js";
import { type ControllerError } from "#io/ControllerError.js";

export const WorkerSubscribers: TEReader<void> = (ctx) => {
  const subscribers: RedisPubSub<any, ServerContext>[] = [
    // media
    GenerateThumbnailPubSub,
    // social posts
    PostToSocialPlatformsPubSub,
  ];

  return pipe(
    subscribers,
    fp.A.traverse(fp.TE.ApplicativePar)((sub) => sub.subscribe()(ctx)),
    fp.TE.map(() => undefined),
  ) as TaskEither<ControllerError, void>;
};
