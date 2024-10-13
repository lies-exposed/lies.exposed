import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { PngType } from "@liexp/shared/lib/io/http/Media/index.js";
import { getMediaThumbKey } from "@liexp/shared/lib/utils/media.utils.js";
import type * as puppeteer from "puppeteer-core";
import { type LinkEntity } from "#entities/Link.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

function getText(linkText: string): string {
  linkText = linkText.replace(/\r\n|\r/g, "\n");
  linkText = linkText.replace(/ +/g, " ");

  // Replace &nbsp; with a space
  const nbspPattern = new RegExp(String.fromCharCode(160), "g");
  return linkText.replace(nbspPattern, " ");
}

// find the link, by going over all links on the page
async function findLinkInPage(
  page: puppeteer.Page,
  linkString: RegExp,
): Promise<puppeteer.ElementHandle<HTMLButtonElement> | null> {
  const links = await page.$$("button");
  for (const link of links) {
    const valueHandle = await link.getProperty("innerText");
    const linkText = await valueHandle.jsonValue();
    const text = getText(linkText);
    const textMatch = text.match(linkString);
    if (textMatch) {
      // console.log(linkString);
      // console.log(text, textMatch);
      // console.log("Found");
      return link;
    }
  }
  return null;
}

const REJECT_ACTION_TEXT_REGEXP =
  /(reject all|disagree|rifiuta tutto |agree)/gi;

const rejectCookieModal = async (page: puppeteer.Page): Promise<void> => {
  const button = await findLinkInPage(page, REJECT_ACTION_TEXT_REGEXP);
  await button?.click();
};

export const takeLinkScreenshot =
  (link: LinkEntity): TEReader<Buffer> =>
  (ctx) => {
    return pipe(
      ctx.puppeteer.getBrowserFirstPage(link.url, {
        env: {
          LANGUAGE: "en_EN",
        },
      }),
      fp.TE.mapLeft(toControllerError),
      fp.TE.chain((page) =>
        pipe(
          fp.TE.tryCatch(async () => {
            await page.emulate(ctx.puppeteer.devices["iPhone 13 Pro"]);
            await new Promise<void>((resolve) => setTimeout(resolve, 3000));
            await rejectCookieModal(page);
            await new Promise<void>((resolve) => setTimeout(resolve, 1000));
            const screenshot = await page.screenshot();
            return Buffer.from(screenshot);
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

export const uploadScreenshot =
  (link: LinkEntity, buffer: Buffer): TEReader<Partial<MediaEntity>> =>
  (ctx) => {
    const mediaKey = getMediaThumbKey(link.image?.id ?? link.id, PngType.value);
    return pipe(
      ctx.s3.upload({
        Bucket: ctx.env.SPACE_BUCKET,
        Key: mediaKey,
        Body: buffer,
        ContentType: PngType.value,
        ACL: "public-read",
      }),
      fp.TE.map((upload) => ({
        ...link.image,
        type: PngType.value,
        location: upload.Location,
        thumbnail: upload.Location,
      })),
    );
  };
