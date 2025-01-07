import { SocialPostEntity } from "@liexp/backend/lib/entities/SocialPost.entity.js";
import { PostToSocialPlatformsPubSub } from "@liexp/backend/lib/pubsub/postToSocialPlatforms.pubSub.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakePublishSocialPostRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.SocialPosts.Custom.Publish,
    ({
      params: { id },
      body: {
        platforms: { IG, TG },
      },
    }) => {
      return pipe(
        ctx.db.findOneOrFail(SocialPostEntity, {
          where: {
            id,
          },
        }),
        TE.chain((p) =>
          pipe(
            PostToSocialPlatformsPubSub.publish({
              ...p.content,
              id,
              platforms: {
                ig: pipe(
                  IG,
                  fp.O.getOrElse(() => false),
                ),
                tg: pipe(
                  TG,
                  fp.O.getOrElse(() => false),
                ),
              },
            })(ctx),
            fp.TE.mapLeft(toControllerError),
          ),
        ),
        TE.map((data) => ({
          body: {
            data: data > 0,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
