import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { MediaEntity } from "#entities/Media.entity.js";
import { createThumbnail } from "#flows/media/thumbnails/createThumbnail.flow.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeGetMediaThumbnailsRoute = (
  r: Router,
  ctx: RouteContext,
): void => {
  AddEndpoint(r)(Endpoints.Media.Custom.GetThumbnails, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(MediaEntity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["creator"],
        },
      }),
      TE.chain((m) =>
        createThumbnail(ctx)({
          ...m,
          id,
        }),
      ),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
