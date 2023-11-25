import { fp } from "@liexp/core/lib/fp";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { PUBLISHED } from "@liexp/shared/lib/io/http/SocialPost";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { SocialPostEntity } from "@entities/SocialPost.entity";
import { postToSocialPlatforms } from "@flows/social-posts/postToPlatforms.flow";
import { type Route } from "@routes/route.types";

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
            postToSocialPlatforms(ctx)(id, {
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
            }),
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
