import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { PUBLISHED, TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost";
import addHours from "date-fns/addHours";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { SocialPostEntity } from "@entities/SocialPost.entity";
import { postToSocialPlatforms } from '@flows/social-posts/postToPlatforms.flow';
import { type Route } from "@routes/route.types";

export const MakeCreateSocialPostRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.SocialPosts.Create,
    ({ params: { id, type }, body: { platforms, ...body } }) => {
      const saveInDb = t.number.is(body.schedule)
        ? pipe(
            ctx.db.save(SocialPostEntity, [
              {
                entity: id,
                type,
                content: {...body, platforms },
                status: TO_PUBLISH.value,
                scheduledAt: addHours(new Date(), body.schedule ?? 0),
              },
            ]),
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
                postToSocialPlatforms(ctx)(id, {...p.content, platforms }),
                TE.chain((result) =>
                  ctx.db.save(SocialPostEntity, [
                    {
                      ...p,
                      entity: id,
                      type,
                      result,
                      status: PUBLISHED.value,
                    },
                  ]),
                ),
              ),
            ),
          );

      return pipe(
        saveInDb,
        TE.map(([data]) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
