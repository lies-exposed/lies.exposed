import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { type UUID } from "io-ts-types";
import { Equal } from "typeorm";
import { MediaEntity } from "#entities/Media.entity.js";
import { createThumbnail } from "#flows/media/thumbnails/createThumbnail.flow.js";
import { type ControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

const generateThumbnailDeferred =
  (ctx: RouteContext) =>
  (id: UUID, m: MediaEntity): TE.TaskEither<ControllerError, [UUID]> => {
    void pipe(
      createThumbnail(ctx)({
        ...m,
        id,
      }),
      TE.chain((thumbnails) =>
        ctx.db.save(MediaEntity, [
          {
            ...m,
            id,
            extra: {
              ...m.extra,
              thumbnails,
            },
          },
        ]),
      ),
      throwTE,
    ).catch((e) => {
      ctx.logger.error.log(
        "An error occurred during thumbnails generation: %O",
        e,
      );
    });

    return TE.right([id]);
  };

export const MakeGenerateMediaThumbnailsRoute = (
  r: Router,
  ctx: RouteContext,
): void => {
  AddEndpoint(r)(
    Endpoints.Media.Custom.GenerateThumbnails,
    ({ params: { id } }) => {
      return pipe(
        ctx.db.findOneOrFail(MediaEntity, {
          where: { id: Equal(id) },
          loadRelationIds: {
            relations: ["creator"],
          },
        }),
        TE.chain((m) => generateThumbnailDeferred(ctx)(id, m)),
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
