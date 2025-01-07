import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import type * as puppeteer from "puppeteer-core";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import {
  type PuppeteerError,
  toPuppeteerError,
} from "../../providers/puppeteer.provider.js";

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

export const takeURLScreenshot =
  (url: string) =>
  <C extends PuppeteerProviderContext>(
    ctx: C,
  ): TaskEither<PuppeteerError, Buffer> => {
    return pipe(
      ctx.puppeteer.getBrowserFirstPage(url, {
        env: {
          LANGUAGE: "en_EN",
        },
      }),
      fp.TE.chain((page) =>
        pipe(
          fp.TE.tryCatch(async () => {
            await page.emulate(ctx.puppeteer.devices["iPhone 13 Pro"]);
            await new Promise<void>((resolve) => setTimeout(resolve, 3000));
            await rejectCookieModal(page);
            await new Promise<void>((resolve) => setTimeout(resolve, 1000));
            const screenshot = await page.screenshot();
            return Buffer.from(screenshot);
          }, toPuppeteerError),
          fp.TE.chainFirst(() =>
            fp.TE.tryCatch(async () => {
              await page.browser().close();
            }, toPuppeteerError),
          ),
        ),
      ),
    );
  };
