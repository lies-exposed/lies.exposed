import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { relationsTransformer } from "@liexp/ui/lib/components/Common/BlockNote/utils/transform.utils.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { toStoryIO } from "./story.io.js";
import { StoryEntity } from "#entities/Story.entity.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeEditStoryRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["event-suggestion:create"]))(
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
          ...body
        },
      },
      r,
    ) => {
      const relations = relationsTransformer(body2 as any);
      return pipe(
        ctx.db.findOneOrFail(StoryEntity, {
          where: { id: Equal(id), creator: Equal(creator) },
        }),
        TE.chain((e) => {
          const featuredImageId = pipe(
            featuredImage,
            O.map((f) => f.id),
            O.getOrElse(() => e.featuredImage as any),
          );

          ctx.logger.debug.log("Featured image %O", featuredImageId);

          return ctx.db.save(StoryEntity, [
            {
              ...e,
              ...body,
              keywords: relations.keywords.map((k) => ({ id: k })),
              actors: relations.actors.map((k) => ({ id: k })),
              groups: relations.groups.map((k) => ({ id: k })),
              media: relations.media.map((m) => ({ id: m })),
              events: relations.events.map((e) => ({ id: e })),
              body2: body2 as any,
              creator: creator as any,
              featuredImage: featuredImageId,
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
          }),
        ),
        TE.chainEitherK(toStoryIO),
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
