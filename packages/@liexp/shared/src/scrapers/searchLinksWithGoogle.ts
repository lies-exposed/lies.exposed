import * as A from "fp-ts/lib/Array";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import { ServerContext } from "../context/server";
import {
  PuppeteerError,
  toPuppeteerError,
} from "../providers/puppeteer.provider";

// const escapeXpathString = (str: string): string => {
//   const splitedQuotes = str.replace(/'/g, `', "'", '`);
//   return `concat('${splitedQuotes}', '')`;
// };

// const clickByText = async (page: Page, text: string): Promise<void> => {
//   const escapedText = escapeXpathString(text);
//   const linkHandlers = await page.$x(`//a[contains(text(), ${escapedText})]`);

//   if (linkHandlers.length > 0) {
//     await linkHandlers[0].click();
//   } else {
//     throw new Error(`Link not found: ${text}`);
//   }
// };

export const searchWithGoogle =
  (ctx: ServerContext) =>
  (
    site: string,
    pageTotal: number,
    q: string
  ): TE.TaskEither<PuppeteerError, string[]> => {
    return pipe(
      ctx.puppeteer.getBrowser(
        `https://www.google.com/advanced_search?q=site:${site}`,
        {
          headless: true,
        }
      ),
      TE.chain((browser) => {
        return TE.tryCatch(async () => {
          // check cookie modal
          const checkCookieModal = async (): Promise<void> => {
            ctx.logger.debug.log("Checking cookie modal...");

            const modal = await page.waitForSelector('div[aria-modal="true"]', {
              timeout: 5000,
            });

            if (modal) {
              ctx.logger.debug.log("Modal found! Reject all cookies...");
              await page.waitForTimeout(1000);
              // refuse cookie
              await page.$$eval('div[aria-modal="true"] button', (els) => {
                const closeButton = els[2] as any;
                closeButton.click();
              });
            }
          };

          // walk page
          const walkPage = async (
            p: number,
            links: string[]
          ): Promise<string[]> => {
            ctx.logger.debug.log("Walk page %d: %O", p, links);
            if (p === pageTotal) {
              ctx.logger.debug.log(
                "Page (%d/%d), returning collected links",
                p,
                pageTotal
              );
              return links;
            }

            await page.waitForSelector(`a[href^="https://${site}"]`);
            const pageLinks = (await page.$$eval(
              `a[href^="https://${site}"]`,
              (el) => el.map((l) => l.getAttribute("href"))
            )) as string[];

            const ll = pipe(links.concat(pageLinks), A.uniq(S.Eq));

            const nextPage = p + 1;
            const pageLinkSelector = `a[aria-label="Page ${nextPage}"]`;
            ctx.logger.debug.log("Searching for a %s", pageLinkSelector);
            const pageLink: any = await page.waitForSelector(pageLinkSelector);

            await pageLink.click();

            await page.waitForNavigation();

            return await walkPage(nextPage, ll);
          };

          // create new page
          const page = await browser.newPage();
          // navigate to google advanced search
          await page.goto(
            `https://www.google.co.uk/advanced_search?q=site:${site}`,
            { waitUntil: "networkidle0" }
          );
          // fill the input with our query
          await page.waitForSelector('[name="as_q"]');
          await page.type('[name="as_q"]', q);

          // submit form
          await page.click('input[type="submit"]');

          await checkCookieModal();

          // walk through pages
          const links = await walkPage(1, []);

          await browser.close();

          return links;
        }, toPuppeteerError);
      })
    );
  };
