import { Media } from "@liexp/shared/io/http";
import { uuid } from "@liexp/shared/utils/uuid";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { createThumbnail } from "./createThumbnail.flow";
import { MediaEntity } from "@entities/Media.entity";
import { ControllerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

export const createAndUpload =
  (ctx: RouteContext) =>
  (
    location: Media.CreateMedia,
    body: any
  ): TE.TaskEither<ControllerError, MediaEntity> => {
    ctx.logger.debug.log("Create media and upload %s", location);

    const mediaId = uuid() as any;
    const mediaKey = `public/media/${mediaId}`;
    return pipe(
      ctx.s3.upload({
        Bucket: ctx.env.SPACE_BUCKET,
        Key: mediaKey,
        Body: body,
      }),
      ctx.logger.debug.logInTaskEither("Result %O"),
      TE.chain((upload) =>
        pipe(
          createThumbnail(ctx)({ ...location, id: mediaId, location: upload.Location }),
          TE.map((thumb) => ({ thumb, upload }))
        )
      ),
      TE.chain(({ upload, thumb }) =>
        ctx.db.save(MediaEntity, [
          {
            ...location,
            events: [],
            links: [],
            id: mediaId,
            location: upload.Location,
            thumbnail: thumb,
          },
        ])
      ),
      TE.map((m) => m[0])
    );
  };
