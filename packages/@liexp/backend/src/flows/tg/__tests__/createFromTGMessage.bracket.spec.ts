import { fp } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import type puppeteer from "puppeteer-core";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { forceKillBrowser } from "../../../providers/puppeteer.provider.js";

describe("createFromTGMessage bracket release", () => {
  let mockPage: ReturnType<typeof mockDeep<puppeteer.Page>>;
  let mockBrowser: ReturnType<typeof mockDeep<puppeteer.Browser>>;

  beforeEach(() => {
    mockPage = mockDeep<puppeteer.Page>();
    mockBrowser = mockDeep<puppeteer.Browser>();
    mockPage.browser.mockReturnValue(mockBrowser);
  });

  test("gracefully closes browser on successful execution", async () => {
    const closeSpy = mockBrowser.close.mockResolvedValue(undefined);

    const release: (page: puppeteer.Page) => TE.TaskEither<any, void> = (
      page,
    ) => {
      const browser = page.browser();
      return pipe(
        TE.tryCatch(
          () => browser.close(),
          (e) => e,
        ),
        TE.orElse(() => forceKillBrowser(browser)),
      );
    };

    const result = await release(mockPage)();

    expect(fp.E.isRight(result)).toBe(true);
    expect(closeSpy).toHaveBeenCalled();
  });

  test("force-kills browser when close() throws (socket dead)", async () => {
    const closeError = new Error("socket hang up");
    mockBrowser.close.mockRejectedValue(closeError);
    mockBrowser.process.mockReturnValue({
      pid: 12345,
    } as any);

    const killSpy = vi.spyOn(process, "kill");

    const release: (page: puppeteer.Page) => TE.TaskEither<any, void> = (
      page,
    ) => {
      const browser = page.browser();
      return pipe(
        TE.tryCatch(
          () => browser.close(),
          (e) => e,
        ),
        TE.orElse(() => forceKillBrowser(browser)),
      );
    };

    const result = await release(mockPage)();

    expect(fp.E.isRight(result)).toBe(true);
    expect(mockBrowser.close).toHaveBeenCalled();
    expect(killSpy).toHaveBeenCalledWith(-12345, "SIGKILL");

    killSpy.mockRestore();
  });

  test("returns error when both close and forceKill fail unexpectedly", async () => {
    const closeError = new Error("socket hang up");
    mockBrowser.close.mockRejectedValue(closeError);
    mockBrowser.process.mockImplementation(() => {
      throw new Error("Cannot access process");
    });

    const release: (page: puppeteer.Page) => TE.TaskEither<any, void> = (
      page,
    ) => {
      const browser = page.browser();
      return pipe(
        TE.tryCatch(
          () => browser.close(),
          (e) => e,
        ),
        TE.orElse(() => forceKillBrowser(browser)),
      );
    };

    const result = await release(mockPage)();

    expect(fp.E.isLeft(result)).toBe(true);
  });

  test("handles process.kill ESRCH gracefully during fallback", async () => {
    const closeError = new Error("socket hang up");
    mockBrowser.close.mockRejectedValue(closeError);
    mockBrowser.process.mockReturnValue({
      pid: 12345,
    } as any);

    const esrchError = new Error("kill ESRCH");
    (esrchError as any).code = "ESRCH";

    const killSpy = vi.spyOn(process, "kill").mockImplementation(() => {
      throw esrchError;
    });

    const release: (page: puppeteer.Page) => TE.TaskEither<any, void> = (
      page,
    ) => {
      const browser = page.browser();
      return pipe(
        TE.tryCatch(
          () => browser.close(),
          (e) => e,
        ),
        TE.orElse(() => forceKillBrowser(browser)),
      );
    };

    const result = await release(mockPage)();

    expect(fp.E.isRight(result)).toBe(true);
    expect(killSpy).toHaveBeenCalledWith(-12345, "SIGKILL");

    killSpy.mockRestore();
  });

  test("uses negative PID for process group kill in fallback", async () => {
    const closeError = new Error("socket hang up");
    mockBrowser.close.mockRejectedValue(closeError);
    mockBrowser.process.mockReturnValue({
      pid: 55555,
    } as any);

    const killSpy = vi.spyOn(process, "kill");

    const release: (page: puppeteer.Page) => TE.TaskEither<any, void> = (
      page,
    ) => {
      const browser = page.browser();
      return pipe(
        TE.tryCatch(
          () => browser.close(),
          (e) => e,
        ),
        TE.orElse(() => forceKillBrowser(browser)),
      );
    };

    await release(mockPage)();

    expect(killSpy).toHaveBeenCalledWith(-55555, "SIGKILL");
    const callArgs = killSpy.mock.calls[0];
    expect(callArgs[0]).toBeLessThan(0);
    expect(callArgs[1]).toBe("SIGKILL");

    killSpy.mockRestore();
  });

  test("does not attempt kill if process() returns undefined during fallback", async () => {
    const closeError = new Error("socket hang up");
    mockBrowser.close.mockRejectedValue(closeError);
    mockBrowser.process.mockReturnValue(undefined as any);

    const killSpy = vi.spyOn(process, "kill");

    const release: (page: puppeteer.Page) => TE.TaskEither<any, void> = (
      page,
    ) => {
      const browser = page.browser();
      return pipe(
        TE.tryCatch(
          () => browser.close(),
          (e) => e,
        ),
        TE.orElse(() => forceKillBrowser(browser)),
      );
    };

    const result = await release(mockPage)();

    expect(fp.E.isRight(result)).toBe(true);
    expect(killSpy).not.toHaveBeenCalled();

    killSpy.mockRestore();
  });
});
