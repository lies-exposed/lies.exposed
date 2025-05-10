import { SocialPostEntity } from "@liexp/backend/lib/entities/SocialPost.entity.js";
import { fetchSocialPostRelations } from "@liexp/backend/lib/flows/social-post/fetchSocialPostRelations.flow.js";
import { SocialPostIO } from "@liexp/backend/lib/io/socialPost.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost.js";
import { addHours } from "date-fns";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toControllerError } from "../../io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeCreateSocialPostRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.SocialPosts.Create,
    ({ params: { id, type }, body: { platforms, ...body } }) => {
      const scheduledAt = addHours(new Date(), body.schedule ?? 0);

      return pipe(
        ctx.db.save(SocialPostEntity, [
          {
            entity: id,
            type,
            content: {
              ...body,
              media: body.media.map((m) => m.id),
              actors: body.actors.map((a) => a.id),
              groups: body.groups.map((g) => g.id),
              keywords: body.keywords.map((k) => k.id),
              platforms,
            },
            status: TO_PUBLISH.literals[0],
            scheduledAt,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
        TE.chainW(([post]) =>
          pipe(
            fetchSocialPostRelations(post.content)(ctx),
            TE.mapLeft(toControllerError),
            TE.map((r) => ({
              ...post,
              content: {
                ...post.content,
                ...r,
                media: r.media.map((r) => ({
                  ...r,
                  links: [],
                })),
              },
            })),
          ),
        ),
        TE.chainEitherK((post) =>
          SocialPostIO.decodeSingle(post, ctx.env.SPACE_ENDPOINT),
        ),
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
