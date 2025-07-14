import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { StoryIO } from "@liexp/backend/lib/io/story.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { relationsTransformer } from "@liexp/shared/lib/providers/blocknote/transform.utils.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeEditStoryRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["event-suggestion:create"])(ctx))(
    Endpoints.Story.Edit,
    (
      {
        params: { id },
        body: {
          featuredImage,
          body2,
          creator,
          keywords,
          media,
          actors,
          groups,
          events,
          restore,
          ...body
        },
      },
      r,
    ) => {
      const relations = relationsTransformer(body2);

      return pipe(
        ctx.db.findOneOrFail(StoryEntity, {
          where: { id: Equal(id), creator: Equal(creator) },
          withDeleted: true,
        }),
        TE.chain((e) => {
          const featuredImageId = pipe(
            featuredImage,
            O.map((f) => f.id),
            O.getOrElse(() => e.featuredImage),
          );

          ctx.logger.debug.log("Featured image %O", featuredImageId);

          const deletedAt = pipe(
            restore,
            O.filter((r) => !!r),
            O.map((r) => null),
            O.getOrElse(() => e.deletedAt),
          );

          return ctx.db.save(StoryEntity, [
            {
              ...e,
              ...body,
              keywords: relations.keywords.map((k) => ({ id: k })),
              actors: relations.actors.map((k) => ({ id: k })),
              groups: relations.groups.map((k) => ({ id: k })),
              media: relations.media.map((m) => ({ id: m })),
              events: relations.events.map((e) => ({ id: e })),
              body2,
              creator,
              featuredImage: featuredImageId,
              deletedAt,
            },
          ]);
        }),
        TE.chain(() =>
          ctx.db.findOneOrFail(StoryEntity, {
            where: { id: Equal(id) },
            relations: ["featuredImage"],
            loadRelationIds: {
              relations: ["creator", "actors", "groups", "keywords"],
            },
            withDeleted: true,
          }),
        ),
        TE.chainEitherK(StoryIO.decodeSingle),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
