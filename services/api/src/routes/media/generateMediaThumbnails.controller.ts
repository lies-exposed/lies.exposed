import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type ServerContext } from "#context/context.type.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { createThumbnail } from "#flows/media/thumbnails/createThumbnail.flow.js";
import { type ControllerError } from "#io/ControllerError.js";
import { type Route } from "#routes/route.types.js";

const generateThumbnailDeferred =
  (ctx: ServerContext) =>
  (id: UUID, m: MediaEntity): TE.TaskEither<ControllerError, [UUID]> => {
    void pipe(
      createThumbnail({
        ...m,
        id,
      })(ctx),
      TE.chain((thumbnails) =>
        ctx.db.save(MediaEntity, [
          {
            ...m,
            id,
            extra: {
              ...m.extra,
              thumbnails,
              needRegenerateThumbnail: false,
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

export const MakeGenerateMediaThumbnailsRoute: Route = (r, ctx) => {
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
