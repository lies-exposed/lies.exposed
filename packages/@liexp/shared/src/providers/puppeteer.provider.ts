/* eslint-disable import/default */
import * as fs from "fs";
import * as logger from "@liexp/core/logger";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import type * as puppeteer from "puppeteer-core";
import { addExtra, VanillaPuppeteer } from "puppeteer-extra";
import puppeteerStealth from "puppeteer-extra-plugin-stealth";
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
        details: [],
      };
    }
    if (e.name === "TimeoutError") {
      return {
        name: "TimeoutPuppeteerError",
        status: 500,
        message: e.message,
        details: [e as any],
      };
    }

    return {
      status: 500,
      name: e.name as any,
      message: e.message,
      details: [],
    };
  }

  puppeteerLogger.error.log("Unknown error %O", e);

  return {
    name: "UnknownPuppeteerError",
    status: 500,
    message: "An error occured",
    details: [],
  };
};

const makePuppeteerError = (name: string, message: string): PuppeteerError =>
  toPuppeteerError({ name, message });

export function getChromePath(): E.Either<PuppeteerError, string> {
  const knownPaths = [
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Program Files/Google/Chrome/Application/chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ];

  const chromePath = knownPaths.find((p) => fs.existsSync(p));

  puppeteerLogger.debug.log("Chrome path %s", chromePath);

  if (!chromePath) {
    return E.left(toPuppeteerError(new Error("Can't find chrome path")));
  }

  return E.right(chromePath);
}

type BrowserLaunchOpts = puppeteer.LaunchOptions &
  puppeteer.BrowserLaunchArgumentOptions;

export interface PuppeteerProvider {
  getBrowser: (
    url: string,
    opts: BrowserLaunchOpts
  ) => TE.TaskEither<PuppeteerError, puppeteer.Browser>;
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
}

// const browserPages = (b: puppeteer.Browser) => TE.tryCatch(() => b.pages(), toPuppeteerError);
// const closePage = (p: puppeteer.Page) => TE.tryCatch(() => p.close(), toPuppeteerError);

export type GetPuppeteerProvider = (
  browser: puppeteer.Browser
) => PuppeteerProvider;

export const GetPuppeteerProvider = (
  pup: VanillaPuppeteer,
  defaultOpts: BrowserLaunchOpts
): PuppeteerProvider => {
  puppeteerLogger.debug.log(`PuppeteerClient with options %O`, defaultOpts);

  // let _pup: puppeteer.Browser;

  const launch = (
    launchOpts: BrowserLaunchOpts
  ): TE.TaskEither<PuppeteerError, puppeteer.Browser> => {
    return pipe(
      getChromePath(),
      TE.fromEither,
      TE.chain((executablePath) => {
        return TE.tryCatch(() => {
          const p = addExtra(pup as any);
          p.use(puppeteerStealth());

          const options = {
            executablePath,
            ...(defaultOpts as any),
            ...launchOpts,
          };

          return pup
            .launch(options)
            .then((b) => b as any as puppeteer.Browser);

        }, toPuppeteerError);
      }),
      TE.map((b) => {
        b.on("disconnected", (e) => {
          puppeteerLogger.debug.log("browser disconnected", e);
        });
        return b;
      })
    );
  };

  const execute = (
    launchOpts: BrowserLaunchOpts,
    te: (
      b: puppeteer.Browser
    ) => TE.TaskEither<PuppeteerError, puppeteer.Browser>
  ): TE.TaskEither<PuppeteerError, void> => {
    return pipe(
      launch(launchOpts),
      TE.chain((b) => te(b)),
      TE.chain((b) => TE.tryCatch(() => b.close(), toPuppeteerError))
    );
  };

  const getBrowser = (
    url: string,
    opts: BrowserLaunchOpts
  ): TE.TaskEither<PuppeteerError, puppeteer.Browser> => {
    return launch({ ...defaultOpts, ...opts });
  };

  const download = (url: string): TE.TaskEither<PuppeteerError, void> => {
    return execute(defaultOpts, (b) => {
      return TE.tryCatch(async () => {
        const page = await b.newPage();
        await page.goto(url);
        await page.click("button");
        return b;
      }, toPuppeteerError);
    });
  };

  const getBrowserFirstPage = (): TE.TaskEither<
    PuppeteerError,
    puppeteer.Page
  > => {
    return pipe(
      launch(defaultOpts),
      TE.chain((browser) => {
        return TE.tryCatch(() => {
          puppeteerLogger.debug.log("getting first browser page");
          return browser.pages().then((pages) => pages[0]);
        }, toPuppeteerError);
      })
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
    getBrowser,
    goToPage,
    download,
    getBrowserFirstPage,
    getPageText,
  };
};
