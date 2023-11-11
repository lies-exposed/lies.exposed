import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { SocialPostEntity } from "@entities/SocialPost.entity";
import { type Route } from "@routes/route.types";

export const MakeEditSocialPostRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.SocialPosts.Edit,
    ({ params: { id }, body: { status, schedule, scheduledAt, ...body } }) => {
      return pipe(
        ctx.db.findOneOrFail(SocialPostEntity, {
          where: { id: Equal(id) },
        }),
        TE.chain((sp) =>
          ctx.db.save(SocialPostEntity, [
            {
              ...sp,
              status,
              content: {
                ...sp.content,
                ...body,
              },
              result: {
                tg: sp.result.tg ?? sp.result,
                ig: sp.result.ig
              },
              id,
              scheduledAt: scheduledAt ?? sp.scheduledAt,
            },
          ]),
        ),
        TE.map(([sp]) => ({
          body: {
            data: sp,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
