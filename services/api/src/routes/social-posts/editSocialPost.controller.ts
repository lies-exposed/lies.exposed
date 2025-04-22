import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { SocialPostEntity } from "@liexp/backend/lib/entities/SocialPost.entity.js";
import { fetchSocialPostRelations } from "@liexp/backend/lib/flows/social-post/fetchSocialPostRelations.flow.js";
import {
  type SocialPostEntityWithContent,
  SocialPostIO,
} from "@liexp/backend/lib/io/socialPost.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal, In } from "typeorm";
import { toControllerError } from "../../io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeEditSocialPostRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.SocialPosts.Edit,
    ({ params: { id }, body: { status, scheduledAt, type, ...body } }) => {
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
              ...body,
              status,
              type,
              content: {
                ...sp.content,
                ...body,
                media: body.media.map((m) => m),
                keywords: keywords.map((k) => k.id),
                groups: groups.map((g) => g.id),
                actors: actors.map((a) => a.id),
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
        TE.chain(([socialPost]) =>
          pipe(
            fetchSocialPostRelations(socialPost.content)(ctx),
            TE.mapLeft(toControllerError),
            TE.map(
              (r): SocialPostEntityWithContent => ({
                ...socialPost,
                content: {
                  ...socialPost.content,
                  ...r,
                },
              }),
            ),
          ),
        ),
        TE.chainEitherK((post) =>
          SocialPostIO.decodeSingle(post, ctx.env.SPACE_ENDPOINT),
        ),
        TE.map((sp) => ({
          body: {
            data: sp,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
