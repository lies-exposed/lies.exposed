import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { PUBLISHED } from "@liexp/shared/lib/io/http/SocialPost.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { SocialPostEntity } from "#entities/SocialPost.entity.js";
import { postToSocialPlatforms } from "#flows/social-posts/postToPlatforms.flow.js";
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
            postToSocialPlatforms(id, {
              ...p.content,
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
            TE.chain(({ ig, tg }) =>
              ctx.db.save(SocialPostEntity, [
                {
                  id,
                  result: {
                    ig: ig ?? p.result.ig,
                    tg: tg ?? p.result.tg,
                  },
                  status: PUBLISHED.value,
                },
              ]),
            ),
          ),
        ),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
