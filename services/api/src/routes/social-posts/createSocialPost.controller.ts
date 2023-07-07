import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import addHours from "date-fns/addHours";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/lib/Apply";
import * as t from "io-ts";
import {
  PUBLISHED,
  SocialPostEntity,
  TO_PUBLISH,
} from "@entities/SocialPost.entity";
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
            ])
          )
        : pipe(
            TE.right({
              content: {
                ...body,
              },
              status: PUBLISHED.value,
            }),
            TE.chain((p) =>
              pipe(
                sequenceS(TE.ApplicativePar)({
                  ig: platforms.IG
                    ? postToIG(ctx)({ ...p.content, platforms }, () =>
                        Promise.reject(new Error("Not implemented"))
                      )
                    : TE.right(undefined),
                  tg: platforms.TG
                    ? postToTG(ctx)(id, { ...p.content, platforms })
                    : TE.right(undefined),
                }),
                ctx.logger.info.logInTaskEither(
                  `Posting ${id} with caption %O`
                ),
                TE.chain((result) =>
                  ctx.db.save(SocialPostEntity, [
                    {
                      ...p,
                      entity: id,
                      type,
                      result,
                    },
                  ])
                )
              )
            )
          );

      return pipe(
        saveInDb,
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
