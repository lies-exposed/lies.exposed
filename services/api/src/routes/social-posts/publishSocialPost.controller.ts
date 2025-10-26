import { getSocialPostById } from "@liexp/backend/lib/flows/social-post/getSocialPostById.flow.js";
import { SocialPostIO } from "@liexp/backend/lib/io/socialPost.io.js";
import { PostToSocialPlatformsPubSub } from "@liexp/backend/lib/pubsub/postToSocialPlatforms.pubSub.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as O from "effect/Option";
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
        getSocialPostById(id)(ctx),
        TE.chainEitherK((post) => SocialPostIO.decodeSingle(post)),
        TE.chain((socialPost) =>
          pipe(
            PostToSocialPlatformsPubSub.publish({
              ...socialPost,
              id,
              platforms: {
                IG: pipe(
                  IG,
                  O.getOrElse(() => false),
                ),
                TG: pipe(
                  TG,
                  O.getOrElse(() => false),
                ),
              },
            })(ctx),
            fp.TE.mapLeft(toControllerError),
          ),
        ),
        fp.TE.map((data) => ({
          body: {
            data: data > 0,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
