import { SocialPostEntity } from "@liexp/backend/lib/entities/SocialPost.entity.js";
import { SocialPostIO } from "@liexp/backend/lib/io/socialPost.io.js";
import { PostToSocialPlatformsPubSub } from "@liexp/backend/lib/pubsub/postToSocialPlatforms.pubSub.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import {
  type SocialPost,
  TO_PUBLISH,
} from "@liexp/shared/lib/io/http/SocialPost.js";
import { addHours } from "date-fns";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type ControllerError } from "../../io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeCreateSocialPostRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.SocialPosts.Create,
    ({ params: { id, type }, body: { platforms, ...body } }) => {
      const saveInDb: TE.TaskEither<
        ControllerError,
        SocialPost | { success: boolean }
      > = Schema.is(Schema.Number)(body.schedule)
        ? pipe(
            ctx.db.save(SocialPostEntity, [
              {
                entity: id,
                type,
                content: { ...body, platforms },
                status: TO_PUBLISH.Type,
                scheduledAt: addHours(new Date(), body.schedule ?? 0),
              },
            ]),
            TE.chainEitherK(SocialPostIO.decodeSingle),
          )
        : pipe(
            TE.right({
              content: {
                ...body,
                platforms,
              },
              scheduledAt: new Date(),
            }),
            TE.chain((p) =>
              pipe(
                PostToSocialPlatformsPubSub.publish({
                  ...p.content,
                  platforms,
                  id,
                })(ctx),
                TE.map((n) => ({ success: n > 0 })),
              ),
            ),
          );

      return pipe(
        saveInDb,
        TE.map((data) => ({
          body: {
            data: data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
