import { pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  IframeVideoType,
  type MediaType,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { createThumbnail } from "./thumbnails/createThumbnail.flow.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";

/**
 * Create the media with its thumbnail and upload it to the S3 bucket.
 * @param ctx - Route context {@link RouteContext}
 * @returns a media entity {@link MediaEntity}
 */
export const createAndUpload: TEFlow<
  [
    Media.CreateMedia,
    { Body: any; ContentType?: MediaType },
    UUID | undefined,
    boolean,
  ],
  MediaEntity
> =
  (ctx) =>
  (createMediaData, { Body, ContentType }, id, extractThumb) => {
    ctx.logger.debug.log("Create media and upload %s", createMediaData);

    const mediaId = id ?? uuid();

    return pipe(
      TE.Do,
      TE.bind("location", () => {
        if (IframeVideoType.is(createMediaData.type)) {
          return TE.right(createMediaData.location);
        }
        const mediaKey = getMediaKey(
          "media",
          mediaId,
          mediaId,
          createMediaData.type,
        );
        return pipe(
          ctx.s3.upload({
            Bucket: ctx.env.SPACE_BUCKET,
            Key: mediaKey,
            Body,
            ContentType,
            ACL: "public-read",
          }),
          TE.map((r) => r.Location),
        );
      }),
      ctx.logger.debug.logInTaskEither("Result %O"),
      TE.bind("thumbnail", ({ location }) =>
        pipe(
          extractThumb
            ? pipe(
                createThumbnail(ctx)({
                  ...createMediaData,
                  id: mediaId,
                  location,
                  thumbnail: null,
                }),
                TE.map((s) => s[0]),
              )
            : TE.right(createMediaData.thumbnail),
        ),
      ),
      TE.chain(({ location, thumbnail }) =>
        ctx.db.save(MediaEntity, [
          {
            ...createMediaData,
            events: [],
            links: [],
            featuredInStories: [],
            keywords: [],
            areas: [],
            id: mediaId,
            location,
            thumbnail,
          },
        ]),
      ),
      TE.map((m) => m[0]),
    );
  };
