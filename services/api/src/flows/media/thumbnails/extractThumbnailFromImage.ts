import { pipe } from "@liexp/core/lib/fp/index.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type ExtractThumbnailFlow } from "./ExtractThumbnailFlow.type.js";
import { toControllerError } from "#io/ControllerError.js";

export const extractThumbnailFromImage: ExtractThumbnailFlow<ImageType> =
  (ctx) => (media) => {
    return pipe(
      ctx.http.get<ArrayBuffer>(media.location, {
        responseType: "arraybuffer",
      }),
      TE.mapLeft(toControllerError),

      TE.chain((stream) =>
        ctx.imgProc.run((sharp) => {
          return sharp(stream)
            .resize({
              width: 640,
              withoutEnlargement: true,
            })
            .toFormat("png")
            .toBuffer();
        }),
      ),
      TE.map((screenshotBuffer) => {
        const thumbnailName = `${media.id}-thumbnail`;

        const key = getMediaKey(
          "media",
          media.id,
          thumbnailName,
          ImageType.types[2].value,
        );

        return {
          Key: key,
          Body: screenshotBuffer,
          ContentType: ImageType.types[2].value,
          Bucket: ctx.env.SPACE_BUCKET,
          ACL: "public-read" as const,
        };
      }),
      TE.map((s) => [s]),
    );
  };
