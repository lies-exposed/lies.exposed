import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { SocialPostEntity } from "@liexp/backend/lib/entities/SocialPost.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal, In } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

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
