import { addDays, parseISO, subDays } from "date-fns";
import * as A from "fp-ts/lib/Array.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as S from "fp-ts/lib/string.js";
import { type Browser } from "puppeteer-core";
import { type ServerContext } from "../context/server.js";
import {
  type PuppeteerError,
  toPuppeteerError,
} from "../providers/puppeteer.provider.js";

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
  (ctx: ServerContext, browser: Browser) =>
  (
    site: string,
    pageTotal: number,
    q: string,
    date: string | undefined,
    keywords: string[],
  ): TE.TaskEither<PuppeteerError, string[]> => {
    return pipe(
      TE.tryCatch(async () => {
        // check cookie modal
        const checkCookieModal = async (): Promise<void> => {
          ctx.logger.debug.log("Checking cookie modal...");

          try {
            await page.waitForSelector('div[aria-modal="true"]', {
              timeout: 5000,
              visible: true,
            });

            ctx.logger.debug.log("Modal found! Reject all cookies...");
            await page.waitForSelector('div[aria-modal="true"] button');
            // refuse cookie
            await page.$$eval('div[aria-modal="true"] button', (els) => {
              const closeButton = els[2] as any;
              closeButton.click();
            });
          } catch (e) {
            ctx.logger.debug.log("No modal found, go on...");
          }
        };

        // walk page
        const walkPage = async (
          p: number,
          links: string[],
        ): Promise<string[]> => {
          ctx.logger.debug.log("Walk page %d: %O", p, links);

          await page.waitForSelector(`a[href^="https://${site}"]`);
          const pageLinks = await page.$$eval(
            `a[href^="https://${site}"]`,
            (el) => el.map((l) => l.getAttribute("href") as any as string),
          );

          const ll = pipe(links.concat(pageLinks), A.uniq(S.Eq));

          if (p === pageTotal) {
            ctx.logger.debug.log(
              "Page (%d/%d), returning collected links %O",
              p,
              pageTotal,
              ll,
            );
            return ll;
          }

          const nextPage = p + 1;
          const pageLinkSelector = `a[aria-label="Page ${nextPage}"]`;
          ctx.logger.debug.log("Searching for a %s", pageLinkSelector);
          const pageLink: any = await page.waitForSelector(pageLinkSelector);

          await pageLink.click();

          await page.waitForNavigation();

          return await walkPage(nextPage, ll);
        };

        // create new page

        const minDate = date
          ? subDays(parseISO(date), 5).toLocaleDateString()
          : undefined;
        const maxDate = date
          ? addDays(parseISO(date), 5).toLocaleDateString()
          : undefined;

        const dateQ = date
          ? `tbs=cdr:1,cd_min:${minDate},cd_max:${maxDate}`
          : "";

        const page = await browser.newPage();
        const searchParams = `q=site:${site}&as_qdr=all&lr=lang_en&${dateQ}`;
        ctx.logger.debug.log("Searching with params %s", searchParams);
        const searchUrl = `https://www.google.co.uk/search?${searchParams}`;
        // navigate to google advanced search
        await page.goto(searchUrl, { waitUntil: "networkidle0" });

        // fill the input with our query
        // await page.waitForSelector('[name="as_q"]');
        // await page.type('[name="as_q"]', (date ? `${date} ` : "") + q);

        // // fill the input with our query
        // await page.waitForSelector('[name="as_oq"]');
        // await page.type('[name="as_oq"]', keywords.join(" OR "));

        // // submit form
        // await page.click('input[type="submit"]');

        await checkCookieModal();

        // walk through pages
        const links = await walkPage(1, []);

        return links;
      }, toPuppeteerError),
    );
  };
