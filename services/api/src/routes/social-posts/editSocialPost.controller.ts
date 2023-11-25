import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal, In } from "typeorm";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { SocialPostEntity } from "@entities/SocialPost.entity";
import { type Route } from "@routes/route.types";

export const MakeEditSocialPostRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.SocialPosts.Edit,
    ({
      params: { id },
      body: { status, schedule, scheduledAt, type, ...body },
    }) => {
      return pipe(
        TE.Do,
        TE.bind("sp", () =>
          ctx.db.findOneOrFail(SocialPostEntity, {
            where: { id: Equal(id) },
          }),
        ),
        TE.bind("keywords", () =>
          ctx.db.find(KeywordEntity, { where: { id: In(body.keywords) } }),
        ),
        TE.bind("groups", () =>
          ctx.db.find(GroupEntity, { where: { id: In(body.groups) } }),
        ),
        TE.bind("actors", () =>
          ctx.db.find(ActorEntity, { where: { id: In(body.actors) } }),
        ),
        TE.chain(({ sp, keywords, groups, actors }) =>
          ctx.db.save(SocialPostEntity, [
            {
              ...sp,
              status,
              type,
              content: {
                ...sp.content,
                ...body,
                keywords,
                groups,
                actors,
              },
              result: {
                tg: sp.result.tg ?? sp.result,
                ig: sp.result.ig,
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
