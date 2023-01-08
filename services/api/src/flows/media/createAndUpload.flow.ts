import { type Media } from "@liexp/shared/lib/io/http";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { createThumbnail } from "./createThumbnail.flow";
import { MediaEntity } from "@entities/Media.entity";
import { type TEFlow } from "@flows/flow.types";

export const createAndUpload: TEFlow<[Media.CreateMedia, any], MediaEntity> =
  (ctx) => (location, body) => {
    ctx.logger.debug.log("Create media and upload %s", location);

    const mediaId = uuid() as any;
    const mediaKey = getMediaKey("media", mediaId, mediaId, location.type);
    return pipe(
      ctx.s3.upload({
        Bucket: ctx.env.SPACE_BUCKET,
        Key: mediaKey,
        Body: body,
        ACL: "public-read",
      }),
      ctx.logger.debug.logInTaskEither("Result %O"),
      TE.chain((upload) =>
        pipe(
          createThumbnail(ctx)({
            ...location,
            id: mediaId,
            location: upload.Location,
          }),
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
