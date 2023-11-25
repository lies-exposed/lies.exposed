import { fp } from "@liexp/core/lib/fp";
import { PngType } from "@liexp/shared/lib/io/http/Media";
import { getMediaThumbKey } from "@liexp/shared/lib/utils/media.utils";
import { pipe } from "fp-ts/function";
import type * as puppeteer from "puppeteer-core";
import { type LinkEntity } from "@entities/Link.entity";
import { type MediaEntity } from "@entities/Media.entity";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";

function getText(linkText: string): string {
  linkText = linkText.replace(/\r\n|\r/g, "\n");
  linkText = linkText.replace(/ +/g, " ");

  // Replace &nbsp; with a space
  const nbspPattern = new RegExp(String.fromCharCode(160), "g");
  return linkText.replace(nbspPattern, " ");
}

// find the link, by going over all links on the page
async function findByLink(
  page: puppeteer.Page,
  linkString: RegExp,
): Promise<puppeteer.ElementHandle<HTMLButtonElement> | null> {
  const links = await page.$$("button");
  for (let i = 0; i < links.length; i++) {
    const valueHandle = await links[i].getProperty("innerText");
    const linkText = await valueHandle.jsonValue();
    const text = getText(linkText);
    const textMatch = text.match(linkString);
    if (textMatch) {
      // console.log(linkString);
      // console.log(text, textMatch);
      // console.log("Found");
      return links[i];
    }
  }
  return null;
}

const REJECT_ACTION_TEXT_REGEXP =
  /(reject all|disagree|rifiuta tutto |agree)/gi;

const rejectCookieModal = async (page: puppeteer.Page): Promise<void> => {
  const button = await findByLink(page, REJECT_ACTION_TEXT_REGEXP);
  await button?.click();
};

export const takeLinkScreenshot: TEFlow<[LinkEntity], Buffer> =
  (ctx) => (link) => {
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
