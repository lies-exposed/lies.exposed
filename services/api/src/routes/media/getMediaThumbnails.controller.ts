import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { MediaEntity } from "@entities/Media.entity";
import { createThumbnail } from '@flows/media/thumbnails/createThumbnail.flow';
import { type RouteContext } from "@routes/route.types";

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
