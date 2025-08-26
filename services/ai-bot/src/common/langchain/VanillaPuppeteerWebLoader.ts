import type { DocumentLoader } from "@langchain/core/document_loaders/base";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Document } from "@langchain/core/documents";
import type { Browser, Page, WaitForOptions } from "puppeteer-core";

type PuppeteerGotoOptions = WaitForOptions & {
  referer?: string;
  referrerPolicy?: string;
};

/**
 * Type representing a function for evaluating JavaScript code on a web
 * page using Puppeteer. It takes a Page and Browser object as parameters
 * and returns a Promise that resolves to a string.
 */
type PuppeteerEvaluate = (page: Page, browser: Browser) => Promise<string>;

type PuppeteerWebBaseLoaderOptions = {
  gotoOptions?: PuppeteerGotoOptions;
  evaluate?: PuppeteerEvaluate;
};

/**
 * Class that extends the BaseDocumentLoader class and implements the
 * DocumentLoader interface. It represents a document loader for scraping
 * web pages using Puppeteer.
 * @example
 * ```typescript
 * const browser = puppeeter.launch({ headless: true });
 * const loader = new VanillaPuppeteerLoader("https:exampleurl.com", browser,
 * });
 * const screenshot = await loader.screenshot();
 * ```
 */
export class VanillaPuppeteerLoader
  extends BaseDocumentLoader
  implements DocumentLoader
{
  options: PuppeteerWebBaseLoaderOptions | undefined;

  constructor(
    public webPath: string,
    private browser: Browser,
    options?: PuppeteerWebBaseLoaderOptions,
  ) {
    super();
    this.options = options ?? undefined;
  }

  static async _scrape(
    browser: Browser,
    url: string,
    options?: PuppeteerWebBaseLoaderOptions,
  ): Promise<{ body: string; title: string; meta: Record<string, string> }> {
    const page = await browser.newPage();

    await page.goto(url, {
      timeout: 180000,
      waitUntil: "domcontentloaded",
      ...options?.gotoOptions,
    });

    const meta = await page.evaluate(() => {
      const metaTags = Array.from(document.querySelectorAll("meta"));

      return metaTags.reduce(
        (acc, metaTag) => {
          const name = metaTag.getAttribute("name");
          const property = metaTag.getAttribute("property");
          const content = metaTag.getAttribute("content");
          if (name) {
            acc[name] = content ?? "";
          } else if (property) {
            acc[property] = content ?? "";
          }
          return acc;
        },
        {} as Record<string, string>,
      );
    });
    const title = await page.title();

    const bodyText = options?.evaluate
      ? await options?.evaluate(page, browser)
      : await page.evaluate(() => document.body.innerText);

    return { body: bodyText, title, meta };
  }

  /**
   * Method that calls the _scrape method to perform the scraping of the web
   * page specified by the webPath property.
   * @returns Promise that resolves to the scraped HTML content of the web page.
   */
  async scrape(): Promise<{
    body: string;
    title: string;
    meta: Record<string, string>;
  }> {
    return VanillaPuppeteerLoader._scrape(
      this.browser,
      this.webPath,
      this.options,
    );
  }

  /**
   * Method that calls the scrape method and returns the scraped HTML
   * content as a Document object.
   * @returns Promise that resolves to an array of Document objects.
   */
  async load(): Promise<Document[]> {
    const { body, title, meta } = await this.scrape();

    const metadata = { source: this.webPath, title, ...meta };

    return [new Document({ pageContent: body, metadata })];
  }

  /**
   * Static class method used to screenshot a web page and return
   * it as a {@link Document} object where  the pageContent property
   * is the screenshot encoded in base64.
   *
   * @param {string} url
   * @param {PuppeteerWebBaseLoaderOptions} options
   * @returns {Document} A document object containing the screenshot of the page encoded in base64.
   */
  static async _screenshot(
    browser: Browser,
    url: string,
    options?: PuppeteerWebBaseLoaderOptions,
  ): Promise<Document> {
    const page = await browser.newPage();

    await page.goto(url, {
      timeout: 180000,
      waitUntil: "domcontentloaded",
      ...options?.gotoOptions,
    });
    const screenshot = await page.screenshot({ encoding: "base64" });

    const metadata = { source: url };
    return new Document({ pageContent: screenshot, metadata });
  }

  /**
   * Screenshot a web page and return it as a {@link Document} object where
   * the pageContent property is the screenshot encoded in base64.
   *
   * @returns {Promise<Document>} A document object containing the screenshot of the page encoded in base64.
   */
  async screenshot(): Promise<Document> {
    return VanillaPuppeteerLoader._screenshot(
      this.browser,
      this.webPath,
      this.options,
    );
  }
}
