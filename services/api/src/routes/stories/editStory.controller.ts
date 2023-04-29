import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toStoryIO } from "./story.io";
import { StoryEntity } from "@entities/Story.entity";
import { type Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

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
      r
    ) => {
      return pipe(
        ctx.db.findOneOrFail(StoryEntity, { where: { id: Equal(id) } }),
        TE.chain((e) => {
          const featuredImageId = pipe(
            featuredImage,
            O.map((f) => f.id),
            O.getOrElse(() => e.featuredImage as any)
          );

          ctx.logger.debug.log("Featured image %O", featuredImageId);

          return ctx.db.save(StoryEntity, [
            {
              ...e,
              ...body,
              keywords: keywords.map((k) => ({ id: k })),
              actors: actors.map((k) => ({ id: k })),
              groups: groups.map((k) => ({ id: k })),
              media: media.map((m) => ({ id: m })),
              events: events.map((e) => ({ id: e })),
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
              relations: ["creator", "keywords"],
            },
          })
        ),
        TE.chainEitherK(toStoryIO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
