import { MediaEntity } from "@entities/Media.entity";
import { ControllerError } from "@io/ControllerError";
import { Media } from "@liexp/shared/io/http";
import { uuid } from "@liexp/shared/utils/uuid";
import { RouteContext } from "@routes/route.types";
import { sequenceS } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { createThumbnail } from "./createThumbnail.flow";

export const createAndUpload =
  (ctx: RouteContext) =>
  (
    location: Media.CreateMedia,
    body: any
  ): TE.TaskEither<ControllerError, MediaEntity> => {
    ctx.logger.debug.log("Create media and upload %s", location);

    const mediaId = uuid() as any;
    const mediaKey = `/public/media/${mediaId}`;
    return pipe(
      sequenceS(TE.ApplicativeSeq)({
        upload: ctx.s3.upload({
          Bucket: ctx.env.SPACE_BUCKET,
          Key: mediaKey,
          Body: body,
        }),
        thumb: createThumbnail(ctx)({ ...location, id: mediaId }),
      }),
      ctx.logger.debug.logInTaskEither('Result %O'),
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
