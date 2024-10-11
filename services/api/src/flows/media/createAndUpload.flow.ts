import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  IframeVideoType,
  type MediaType,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import { saveMedia } from "./saveMedia.flow.js";
import { createThumbnail } from "./thumbnails/createThumbnail.flow.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { type RouteContext } from "#routes/route.types.js";

export const createAndUpload = (
  createMediaData: Media.CreateMedia,
  { Body, ContentType }: { Body: any; ContentType?: MediaType },
  id: UUID | undefined,
  extractThumb: boolean,
): TEReader<MediaEntity> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("mediaId", () => fp.RTE.right(id ?? uuid())),
    fp.RTE.bind("location", ({ mediaId }) => {
      // ctx.logger.debug.log("Create media and upload %s", createMediaData);

      if (IframeVideoType.is(createMediaData.type)) {
        return fp.RTE.right(createMediaData.location);
      }
      const mediaKey = getMediaKey(
        "media",
        mediaId,
        mediaId,
        createMediaData.type,
      );
      return pipe(
        fp.RTE.ask<RouteContext>(),
        fp.RTE.chainTaskEitherK((ctx) =>
          ctx.s3.upload({
            Bucket: ctx.env.SPACE_BUCKET,
            Key: mediaKey,
            Body,
            ContentType,
            ACL: "public-read",
          }),
        ),
        fp.RTE.map((r) => r.Location),
      );
    }),
    // ctx.logger.debug.logInTaskEither("Result %O"),
    fp.RTE.bind("thumbnail", ({ mediaId, location }) =>
      pipe(
        extractThumb
          ? pipe(
              createThumbnail({
                ...createMediaData,
                id: mediaId,
                location,
                thumbnail: null,
              }),
              fp.RTE.map((s) => s[0]),
            )
          : fp.RTE.right(createMediaData.thumbnail),
      ),
    ),
    fp.RTE.chain(({ mediaId, location, thumbnail }) =>
      saveMedia([
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
    fp.RTE.map((m) => m[0]),
  );
};
