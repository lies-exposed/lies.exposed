import { SocialPostEntity } from "@liexp/backend/lib/entities/SocialPost.entity.js";
import { fetchSocialPostRelations } from "@liexp/backend/lib/flows/social-post/fetchSocialPostRelations.flow.js";
import { SocialPostIO } from "@liexp/backend/lib/io/socialPost.io.js";
import { addOrder, getORMOptions } from "@liexp/backend/lib/utils/orm.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { takeSocialPostRelations } from "@liexp/shared/lib/helpers/social-post.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { Schema } from "effect";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeListSocialPostRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.SocialPosts.List,
    ({ query: { status, entity, distinct, type, ...query } }) => {
      const findSocialPostQuery = ctx.db.manager
        .createQueryBuilder()
        .select()
        .from(SocialPostEntity, "sp");

      const ormOpts = getORMOptions(query, ctx.env.DEFAULT_PAGE_SIZE);

      if (fp.O.isSome(type)) {
        findSocialPostQuery.where('"type" = :type', {
          type: type.value,
        });
      }
      if (fp.O.isSome(status)) {
        findSocialPostQuery.andWhere("status = :status", {
          status: status.value,
        });
      }

      if (fp.O.isSome(entity)) {
        findSocialPostQuery.andWhere("entity = :entity", {
          entity: entity.value,
        });
      }

      const isDistinct = pipe(
        distinct,
        fp.O.filter((distinct) => distinct),
        fp.O.isSome,
      );

      if (isDistinct) {
        findSocialPostQuery.distinctOn(["sp.entity"]);
        findSocialPostQuery.groupBy("sp.entity");
        ormOpts.order = {
          entity: "DESC",
          ...(ormOpts.order ?? {}),
        };
      }

      if (ormOpts.order) {
        addOrder(
          ormOpts.order,
          findSocialPostQuery,
          "sp",
          isDistinct ? ["sp.entity"] : [],
        );
      }

      findSocialPostQuery
        .addSelect("*")
        .addSelect(
          (s) => {
            s.from(SocialPostEntity, "sub_sp")
              .addSelect("count(*)", "publishCount")
              .where('"entity" = "sp"."entity"');
            if (fp.O.isSome(type)) {
              s.andWhere('"type" = :type', {
                type: type.value,
              });
            }

            return s;
          },

          "publishCount",
        )
        .addGroupBy("sp.id")
        .skip(ormOpts.skip)
        .take(ormOpts.take);

      ctx.logger.debug.log(
        `Find social posts %O`,
        findSocialPostQuery.getQueryAndParameters(),
      );

      return pipe(
        sequenceS(TE.ApplicativePar)({
          data: pipe(
            ctx.db.execQuery(() => findSocialPostQuery.getRawAndEntities()),
            TE.map((data) => data.raw),
            TE.chain((data) =>
              pipe(
                data.map((d) => ({
                  ...d,
                  media: (Array.isArray(d.content.media)
                    ? d.content.media
                    : []
                  ).filter(Schema.is(UUID)),
                  actors: (d.content.actors ?? []).filter(Schema.is(UUID)),
                  groups: (d.content.groups ?? []).filter(Schema.is(UUID)),
                  keywords: (d.content.keywords ?? []).filter(Schema.is(UUID)),
                })),
                TE.right,
                TE.map(takeSocialPostRelations),
                TE.chain((relations) =>
                  fetchSocialPostRelations(relations)(ctx),
                ),
                TE.map((relations) =>
                  data.map((post) => ({
                    ...post,
                    content: {
                      ...post.content,
                      media: relations.media.filter((m) =>
                        post.content.media.includes(m.id),
                      ),
                      actors: relations.actors.filter((a) =>
                        post.content.actors.includes(a.id),
                      ),
                      groups: relations.groups.filter((g) =>
                        post.content.groups.includes(g.id),
                      ),
                      keywords: relations.keywords.filter((k) =>
                        post.content.keywords.includes(k.id),
                      ),
                    },
                  })),
                ),
              ),
            ),
            TE.chainEitherK((posts) => SocialPostIO.decodeMany(posts)),
          ),
          total: ctx.db.execQuery(() => findSocialPostQuery.getCount()),
        }),
        TE.map(({ data, total }) => ({
          body: {
            data,
            total,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
