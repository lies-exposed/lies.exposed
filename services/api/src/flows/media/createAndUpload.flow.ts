import { pipe } from "@liexp/core/lib/fp/index.js";
import { type MediaType } from "@liexp/shared/lib/io/http/Media.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { createThumbnail } from "./thumbnails/createThumbnail.flow.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";

export const createAndUpload: TEFlow<
  [
    Media.CreateMedia,
    { Body: any; ContentType?: MediaType },
    string | undefined,
    boolean,
  ],
  MediaEntity
> =
  (ctx) =>
  (location, { Body, ContentType }, id, extractThumb) => {
    ctx.logger.debug.log("Create media and upload %s", location);

    const mediaId = id ?? (uuid() as any);
    const mediaKey = getMediaKey("media", mediaId, mediaId, location.type);
    return pipe(
      ctx.s3.upload({
        Bucket: ctx.env.SPACE_BUCKET,
        Key: mediaKey,
        Body,
        ContentType,
        ACL: "public-read",
      }),
      ctx.logger.debug.logInTaskEither("Result %O"),
      TE.chain((upload) =>
        pipe(
          extractThumb
            ? pipe(
                createThumbnail(ctx)({
                  ...location,
                  id: mediaId,
                  location: upload.Location,
                }),
                TE.map((s) => s[0]),
              )
            : TE.right(location.thumbnail),
          TE.map((thumb) => ({ thumb, upload })),
        ),
      ),
      TE.chain(({ upload, thumb }) =>
        ctx.db.save(MediaEntity, [
          {
            ...location,
            events: [],
            links: [],
            featuredIn: [],
            keywords: [],
            areas: [],
            id: mediaId,
            location: upload.Location,
            thumbnail: thumb,
          },
        ]),
      ),
      TE.map((m) => m[0]),
    );
  };
