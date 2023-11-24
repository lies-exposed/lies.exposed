import { fp } from "@liexp/core/lib/fp";
import { PngType } from "@liexp/shared/lib/io/http/Media";
import { getMediaThumbKey } from "@liexp/shared/lib/utils/media.utils";
import { pipe } from "fp-ts/function";
import { type LinkEntity } from "@entities/Link.entity";
import { type MediaEntity } from "@entities/Media.entity";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";

export const takeLinkScreenshot: TEFlow<[LinkEntity], Buffer> =
  (ctx) => (link) => {
    return pipe(
      ctx.puppeteer.getBrowserFirstPage(link.url, {}),
      fp.TE.mapLeft(toControllerError),
      fp.TE.chain((page) =>
        pipe(
          fp.TE.tryCatch(async () => {
            await page.emulate(ctx.puppeteer.devices["iPhone 13 Pro"]);
            await new Promise<void>((resolve) => setTimeout(resolve, 5000));
            const screenshot = await page.screenshot();
            return screenshot;
          }, toControllerError),
          fp.TE.chainFirst(() =>
            fp.TE.tryCatch(async () => {
              await page.browser().close();
            }, toControllerError),
          ),
        ),
      ),
    );
  };

export const uploadScreenshot: TEFlow<
  [LinkEntity, Buffer],
  Partial<MediaEntity>
> = (ctx) => (link, buffer) => {
  const mediaKey = getMediaThumbKey(
    link.image?.id ? link.image.id : link.id,
    PngType.value,
  );
  return pipe(
    ctx.s3.upload({
      Bucket: ctx.env.SPACE_BUCKET,
      Key: mediaKey,
      Body: buffer,
      ContentType: PngType.value,
      ACL: 'public-read'
    }),
    fp.TE.map((upload) => ({
      ...link.image,
      type: PngType.value,
      location: upload.Location,
      thumbnail: upload.Location,
    })),
  );
};
