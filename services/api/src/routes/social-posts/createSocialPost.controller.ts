import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { PUBLISHED, TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost";
import addHours from "date-fns/addHours";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { SocialPostEntity } from "@entities/SocialPost.entity";
import { postToIG } from "@flows/events/postToIG.flow";
import { postToTG } from "@flows/events/postToTG.flow";
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
                content: body,
                status: TO_PUBLISH.value,
                scheduledAt: addHours(new Date(), body.schedule ?? 0),
              },
            ]),
          )
        : pipe(
            TE.right({
              content: {
                ...body,
              },
              scheduledAt: new Date(),
            }),
            TE.chain((p) =>
              pipe(
                sequenceS(TE.ApplicativePar)({
                  ig: platforms.IG
                    ? postToIG(ctx)({ ...p.content, platforms }, (e) =>
                        Promise.resolve({
                          code: "invalid",
                        }),
                      )
                    : TE.right(undefined),
                  tg: platforms.TG
                    ? postToTG(ctx)(id, { ...p.content, platforms })
                    : TE.right(undefined),
                }),
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
