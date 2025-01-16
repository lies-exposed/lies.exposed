import * as fs from "fs";
import * as logger from "@liexp/core/lib/logger/index.js";
import { differenceInSeconds } from "date-fns";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import type * as puppeteer from "puppeteer-core";
import { type VanillaPuppeteer } from "puppeteer-extra";
import { IOError } from "ts-io-error";

const puppeteerLogger = logger.GetLogger("puppeteer");

class ConnectionRefusePuppeteerError extends IOError {
  name = "ConnectionRefusePuppeteerError";
}

class NameNotResolvedError extends IOError {
  name = "NameNotResolvedError";
}

class MissingPuppeteerResponseError extends IOError {
  name = "MissingPuppeteerResponseError";
}

class TimeoutPuppeteerError extends IOError {
  name = "TimeoutPuppeteerError";
}

class UnknownPuppeteerError extends IOError {
  name = "UnknownPuppeteerError";
}

export type PuppeteerError =
  | NameNotResolvedError
  | ConnectionRefusePuppeteerError
  | MissingPuppeteerResponseError
  | TimeoutPuppeteerError
  | UnknownPuppeteerError;

export const toPuppeteerError = (e: unknown): PuppeteerError => {
  puppeteerLogger.error.log("Error %O", e);

  if (e instanceof Error) {
    if (e.message.startsWith("net::ERR_NAME_NOT_RESOLVED")) {
      return new NameNotResolvedError(e.message, {
        kind: "ServerError",
        status: "500",
        meta: e.stack,
      });
    }
    if (e.name === "TimeoutError") {
      return new TimeoutPuppeteerError(e.message, {
        kind: "ServerError",
        status: "500",
        meta: e.stack,
      });
    }

    return new UnknownPuppeteerError(`${e.name}: ${e.message}`, {
      status: "500",
      kind: "ServerError",
      meta: e.stack,
    });
  }

  puppeteerLogger.error.log("Unknown error %O", e);

  return new UnknownPuppeteerError("An error occurred", {
    status: "500",
    kind: "ServerError",
    meta: e,
  });
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

type BrowserLaunchOpts = puppeteer.LaunchOptions;

export interface PuppeteerProvider {
  devices: typeof puppeteer.KnownDevices;
  getBrowser: (
    opts: BrowserLaunchOpts,
  ) => TE.TaskEither<PuppeteerError, puppeteer.Browser>;
  goToPage: (
    url: string,
  ) => (
    page: puppeteer.Page,
  ) => TE.TaskEither<PuppeteerError, puppeteer.HTTPResponse>;
  download: (url: string) => TE.TaskEither<PuppeteerError, any>;
  getBrowserFirstPage: (
    url: string,
    opts: BrowserLaunchOpts,
  ) => TE.TaskEither<PuppeteerError, puppeteer.Page>;
  getPageText: (
    r: puppeteer.HTTPResponse,
  ) => TE.TaskEither<PuppeteerError, string>;
  execute: <T>(
    opts: BrowserLaunchOpts,
    te: (
      b: puppeteer.Browser,
      page: puppeteer.Page,
    ) => TE.TaskEither<PuppeteerError, T>,
  ) => TE.TaskEither<PuppeteerError, T>;
}

// const browserPages = (b: puppeteer.Browser) => TE.tryCatch(() => b.pages(), toPuppeteerError);
// const closePage = (p: puppeteer.Page) => TE.tryCatch(() => p.close(), toPuppeteerError);

export type GetPuppeteerProvider = (
  browser: puppeteer.Browser,
) => PuppeteerProvider;

export const GetPuppeteerProvider = (
  pup: VanillaPuppeteer,
  defaultOpts: BrowserLaunchOpts,
  devices: typeof puppeteer.KnownDevices,
): PuppeteerProvider => {
  puppeteerLogger.debug.log(`PuppeteerClient with options %O`, defaultOpts);

  // let _pup: puppeteer.Browser;

  const launch = (
    opts: BrowserLaunchOpts,
  ): TE.TaskEither<PuppeteerError, puppeteer.Browser> => {
    return pipe(
      getChromePath(),
      TE.fromEither,
      TE.chain((executablePath) => {
        return TE.tryCatch(async () => {
          const options = {
            executablePath,
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
            protocolTimeout: 30_000,
            ...defaultOpts,
            ...opts,
          };

          puppeteerLogger.info.log("Launching browser with %O", options);

          const b = await pup.launch(options);
          return b as puppeteer.Browser;
        }, toPuppeteerError);
      }),
      TE.map((b) => {
        const connectedAt = new Date();
        b.on("error", (e) => {
          puppeteerLogger.error.log("browser error", e);
        });
        b.on("disconnected", (e) => {
          puppeteerLogger.debug.log(
            "browser disconnected %ds",
            differenceInSeconds(new Date(), connectedAt, {
              roundingMethod: "ceil",
            }),
          );
        });
        return b;
      }),
    );
  };

  const execute = <T>(
    opts: BrowserLaunchOpts,
    te: (
      b: puppeteer.Browser,
      page: puppeteer.Page,
    ) => TE.TaskEither<PuppeteerError, T>,
  ): TE.TaskEither<PuppeteerError, T> => {
    return pipe(
      TE.bracket(
        launch(opts),
        (b) =>
          pipe(
            TE.tryCatch(() => b.newPage(), toPuppeteerError),
            TE.chain((p) => te(b, p)),
          ),
        (b) => TE.tryCatch(() => b.close(), toPuppeteerError),
      ),
    );
  };

  const getBrowser = (
    opts: BrowserLaunchOpts,
  ): TE.TaskEither<PuppeteerError, puppeteer.Browser> => {
    return launch(opts);
  };

  const download = (url: string): TE.TaskEither<PuppeteerError, void> => {
    return pipe(
      execute(defaultOpts, (b) => {
        return TE.tryCatch(async () => {
          const page = await b.newPage();
          await page.goto(url);
          await page.click("button");
          return b;
        }, toPuppeteerError);
      }),
      TE.map(() => undefined),
    );
  };

  const getBrowserFirstPage = (
    url: string,
    opts: BrowserLaunchOpts,
  ): TE.TaskEither<PuppeteerError, puppeteer.Page> => {
    return pipe(
      launch(opts),
      TE.chain((browser) => {
        return TE.tryCatch(async () => {
          puppeteerLogger.debug.log("getting first browser page");
          const p = await browser.pages().then((pages) => pages[0]);
          await p.goto(url);
          return p;
        }, toPuppeteerError);
      }),
    );
  };

  const goToPage = (url: string) => (page: puppeteer.Page) => {
    page.on("error", (e) => {
      puppeteerLogger.error.log("page error", e);
    });

    return pipe(
      TE.tryCatch(() => page.goto(url), toPuppeteerError),
      TE.chain((response) => {
        puppeteerLogger.debug.log("page exists: %d", response?.status() ?? 500);
        if (!response) {
          return TE.left(
            makePuppeteerError(
              "MissingPuppeteerResponseError",
              `Puppeteer page response is null for ${url}`,
            ),
          );
        }

        return TE.right(response);
      }),
    );
  };

  const getPageText = (
    response: puppeteer.HTTPResponse,
  ): TE.TaskEither<PuppeteerError, string> => {
    return TE.tryCatch(() => {
      puppeteerLogger.debug.log("getting page text for %s...", response.url());
      return response.text();
    }, toPuppeteerError);
  };

  return {
    devices,
    execute,
    getBrowser,
    goToPage,
    download,
    getBrowserFirstPage,
    getPageText,
  };
};

/**
 * Check the element exists before evaluating callback
 *
 * @param p puppeteer page object
 * @returns value returned from `onEval` when sel is present, or undefined
 */
export const $safeEvalOrUndefined =
  (p: puppeteer.Page) =>
  async <
    Selector extends string,
    Params extends unknown[],
    Func extends puppeteer.EvaluateFuncWith<
      puppeteer.NodeFor<Selector>,
      Params
    > = puppeteer.EvaluateFuncWith<puppeteer.NodeFor<Selector>, Params>,
  >(
    sel: Selector,
    onEval: Func,
  ): Promise<string | undefined> => {
    let ret: any;
    const el = await p.$(sel);
    if (el) {
      ret = await p.$eval(sel, onEval as any);
    }
    return ret;
  };

/**
 * Get the first valid result of element evaluation from an array of selectors.
 * It throws when no value is returned by $safeEvalOrUndefined loop.
 *
 * @param p puppeteer page object
 * @returns The first evaluated result from given selectors
 */
export const $evalManyOrUndefined =
  (p: puppeteer.Page) =>
  async <
    Selector extends string,
    Params extends unknown[],
    Func extends puppeteer.EvaluateFuncWith<
      puppeteer.NodeFor<Selector>,
      Params
    > = puppeteer.EvaluateFuncWith<puppeteer.NodeFor<Selector>, Params>,
  >(
    sel: Selector[],
    onEval: Func,
  ): Promise<string | undefined> => {
    let ret: string | undefined;
    const evall = $safeEvalOrUndefined(p);
    for (const s of sel) {
      if (ret) {
        break;
      }
      ret = await evall(s, onEval as any);
    }

    return ret;
  };
