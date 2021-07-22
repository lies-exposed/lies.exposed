import * as logger from "@econnessione/core/logger";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import type puppeteer from "puppeteer";
import * as error from "../io/http/Error";

const puppeteerLogger = logger.GetLogger("puppeteer");

export const ConnectionRefusePuppeteerError = "ConnectionRefusePuppeteerError";
interface ConnectionRefusePuppeteerError extends error.CoreError {
  name: typeof ConnectionRefusePuppeteerError;
}

interface NameNotResolvedError extends error.CoreError {
  name: "NameNotResolvedError";
}

interface MissingPuppeteerResponseError extends error.CoreError {
  name: "MissingPuppeteerResponseError";
}

interface TimeoutPuppeteerError extends error.CoreError {
  name: "TimeoutPuppeteerError";
}

interface UnknownPuppeteerError extends error.CoreError {
  name: "UnknownPuppeteerError";
}

export type PuppeteerError =
  | NameNotResolvedError
  | ConnectionRefusePuppeteerError
  | MissingPuppeteerResponseError
  | TimeoutPuppeteerError
  | UnknownPuppeteerError;

export const toPuppeteerError = (e: unknown): PuppeteerError => {
  if (e instanceof Error) {
    puppeteerLogger.error.log("Error %O", e);
    if (e.message.indexOf("net::ERR_NAME_NOT_RESOLVED") === 0) {
      return {
        name: "NameNotResolvedError",
        status: 500,
        message: e.message,
        details: []
      };
    }
    if (e.name === "TimeoutError") {
      return {
        name: "TimeoutPuppeteerError",
        status: 500,
        message: e.message,
        details: [e as any]
      };
    }

    return {
      status: 500,
      name: e.name as any,
      message: e.message,
      details: []
    };
  }

  puppeteerLogger.error.log("Unknown error %O", e);

  return {
    name: "UnknownPuppeteerError",
    status: 500,
    message: "An error occured",
    details: []
  };
};

const makePuppeteerError = (name: string, message: string): PuppeteerError =>
  toPuppeteerError({ name, message });

export interface PuppeteerProvider {
  browser: puppeteer.Browser;
  goToPage: (
    url: string
  ) => (
    page: puppeteer.Page
  ) => TE.TaskEither<PuppeteerError, puppeteer.HTTPResponse>;
  download: (url: string) => TE.TaskEither<PuppeteerError, any>;
  getBrowserFirstPage: () => TE.TaskEither<PuppeteerError, puppeteer.Page>;
  getPageText: (
    r: puppeteer.HTTPResponse
  ) => TE.TaskEither<error.CoreError, string>;
  close: () => TE.TaskEither<error.CoreError, void>;
}

// const browserPages = (b: puppeteer.Browser) => TE.tryCatch(() => b.pages(), toPuppeteerError);
// const closePage = (p: puppeteer.Page) => TE.tryCatch(() => p.close(), toPuppeteerError);

type MakeCOPPuppeteerClient = (browser: puppeteer.Browser) => PuppeteerProvider;

const MakeCOPPuppeteerClient = (
  browser: puppeteer.Browser
): PuppeteerProvider => {
  browser.on("disconnected", (e) => {
    puppeteerLogger.debug.log("browser disconnected", e);
  });

  const download = (url: string): TE.TaskEither<PuppeteerError, void> => {
    return TE.tryCatch(async () => {
      const page = await browser.newPage();
      await page.goto(url);
      await page.click("button");
    }, toPuppeteerError);
  };

  const getBrowserFirstPage = (): TE.TaskEither<
    PuppeteerError,
    puppeteer.Page
  > => {
    puppeteerLogger.debug.log("getting first browser page");
    return TE.tryCatch(
      () => browser.pages().then((pages) => pages[0]),
      toPuppeteerError
    );
  };

  const goToPage = (url: string) => (page: puppeteer.Page) => {
    page.on("error", (e) => {
      puppeteerLogger.error.log("page error", e);
    });

    return pipe(
      TE.tryCatch(() => page.goto(url), toPuppeteerError),
      TE.chain((response) => {
        puppeteerLogger.debug.log("page exists", response.status());
        if (!response) {
          return TE.left(
            makePuppeteerError(
              "MissingPuppeteerResponseError",
              `Puppeteer page response is null for ${url}`
            )
          );
        }

        return TE.right(response);
      })
    );
  };

  const getPageText = (
    response: puppeteer.HTTPResponse
  ): TE.TaskEither<PuppeteerError, string> => {
    return TE.tryCatch(() => {
      puppeteerLogger.debug.log("getting page text for %s...", response.url());
      return response.text();
    }, toPuppeteerError);
  };

  return {
    browser,
    goToPage,
    download,
    getBrowserFirstPage,
    getPageText,
    close: () => TE.tryCatch(() => browser.close(), toPuppeteerError)
  };
};

export interface PuppeteerClient {
  launch: (
    opts?: puppeteer.BrowserLaunchArgumentOptions
  ) => TE.TaskEither<PuppeteerError, PuppeteerProvider>;
}

export type MakePuppeteerClient = (
  p: typeof puppeteer,
  launchOpts: puppeteer.LaunchOptions & puppeteer.BrowserLaunchArgumentOptions
) => PuppeteerClient;
export const MakePuppeteerClient: MakePuppeteerClient = (p, launchOpts) => {
  puppeteerLogger.debug.log(
    `PuppeteerClient with options paths %O`,
    launchOpts
  );

  return {
    launch: (opts) =>
      pipe(
        TE.tryCatch(
          () => p.launch({ ...launchOpts, ...opts }),
          toPuppeteerError
        ),
        TE.map((b) => MakeCOPPuppeteerClient(b))
      )
  };
};
