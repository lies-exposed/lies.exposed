import { pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { createThumbnail } from "#flows/media/thumbnails/createThumbnail.flow.js";

export const generateThumbnailFlow: TEFlow<[{ id: UUID }], MediaEntity> =
  ({ id }) =>
  (ctx) => {
    return pipe(
      TE.Do,
      TE.bind("media", () =>
        ctx.db.findOneOrFail(MediaEntity, {
          where: { id: Equal(id) },
          loadRelationIds: {
            relations: ["creator"],
          },
        }),
      ),
      TE.bind("thumbnails", ({ media }) => {
        return createThumbnail({
          ...media,
          id,
        })(ctx);
      }),
      TE.chain(({ thumbnails, media }) =>
        ctx.db.save(MediaEntity, [
          {
            ...media,
            id,
            extra: {
              ...media.extra,
              thumbnails,
              needRegenerateThumbnail: false,
            },
          },
        ]),
      ),
      TE.map((media) => media[0]),
    );
  };
