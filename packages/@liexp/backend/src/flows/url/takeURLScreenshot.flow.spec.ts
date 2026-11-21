import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import {
  type Browser,
  type ElementHandle,
  type JSHandle,
  type Page,
} from "puppeteer-core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { mockedContext } from "../../test/context.js";
import { takeURLScreenshot } from "./takeURLScreenshot.flow.js";

type TakeURLScreenshotContext = PuppeteerProviderContext;

const makeMockBrowser = (): MockProxy<Browser> => {
  const browser = mock<Browser>();
  browser.close.mockResolvedValue(undefined);
  return browser;
};

const makeMockPage = (browser: Browser): MockProxy<Page> => {
  const page = mock<Page>();
  page.emulate.mockResolvedValue(undefined);
  page.browser.mockReturnValue(browser);
  page.$$.mockResolvedValue([]);
  return page;
};

const makeMockButtonHandle = (
  innerText: string,
): ElementHandle<HTMLButtonElement> => {
  const valueHandle = mock<JSHandle<string>>();
  valueHandle.jsonValue.mockResolvedValue(innerText);

  const handle = mock<ElementHandle<HTMLButtonElement>>();
  handle.getProperty.mockResolvedValue(valueHandle);
  handle.click.mockResolvedValue(undefined);
  return handle;
};

describe(takeURLScreenshot.name, () => {
  const appTest = {
    ctx: mockedContext<TakeURLScreenshotContext>({
      puppeteer: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a Buffer containing the screenshot on success", async () => {
    const url = "https://example.com";
    const screenshotData = Buffer.from("fake-screenshot-data");

    const mockBrowser = makeMockBrowser();
    const mockPage = makeMockPage(mockBrowser);
    mockPage.screenshot.mockResolvedValue(screenshotData);

    appTest.ctx.puppeteer.getBrowserFirstPage.mockReturnValueOnce(
      fp.TE.right(mockPage),
    );

    const result = await pipe(takeURLScreenshot(url)(appTest.ctx), throwTE);

    expect(appTest.ctx.puppeteer.getBrowserFirstPage).toHaveBeenCalledWith(
      url,
      { env: { LANGUAGE: "en_EN" } },
    );
    expect(mockPage.emulate).toHaveBeenCalledWith(
      appTest.ctx.puppeteer.devices["iPhone 13 Pro"],
    );
    expect(mockPage.screenshot).toHaveBeenCalled();
    expect(Buffer.isBuffer(result)).toBe(true);
  }, 10000);

  it("should return a PuppeteerError when getBrowserFirstPage fails", async () => {
    const url = "https://unreachable.example.com";
    const { toPuppeteerError } =
      await import("../../providers/puppeteer.provider.js");
    const puppeteerError = toPuppeteerError(
      new Error("net::ERR_NAME_NOT_RESOLVED"),
    );

    appTest.ctx.puppeteer.getBrowserFirstPage.mockReturnValueOnce(
      fp.TE.left(puppeteerError),
    );

    const either = await pipe(takeURLScreenshot(url)(appTest.ctx))();

    expect(fp.E.isLeft(either)).toBe(true);
    if (fp.E.isLeft(either)) {
      expect(either.left).toBe(puppeteerError);
    }
  });

  it("should close the browser even when screenshot succeeds", async () => {
    const url = "https://example.com/page";
    const screenshotData = Buffer.from("screenshot");

    const mockBrowser = makeMockBrowser();
    const mockPage = makeMockPage(mockBrowser);
    mockPage.screenshot.mockResolvedValue(screenshotData);

    appTest.ctx.puppeteer.getBrowserFirstPage.mockReturnValueOnce(
      fp.TE.right(mockPage),
    );

    await pipe(takeURLScreenshot(url)(appTest.ctx), throwTE);

    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  }, 10000);

  it("should return a PuppeteerError when screenshot throws", async () => {
    const url = "https://example.com";

    const mockBrowser = makeMockBrowser();
    const mockPage = makeMockPage(mockBrowser);
    mockPage.screenshot.mockRejectedValue(new Error("Screenshot failed"));

    appTest.ctx.puppeteer.getBrowserFirstPage.mockReturnValueOnce(
      fp.TE.right(mockPage),
    );

    const either = await pipe(takeURLScreenshot(url)(appTest.ctx))();

    expect(fp.E.isLeft(either)).toBe(true);
    if (fp.E.isLeft(either)) {
      expect(either.left.message).toContain("Screenshot failed");
    }
  }, 10000);

  it("should attempt to click cookie reject button when found", async () => {
    const url = "https://cookiebanner.example.com";
    const screenshotData = Buffer.from("screenshot");

    const mockBrowser = makeMockBrowser();
    const mockPage = makeMockPage(mockBrowser);
    mockPage.screenshot.mockResolvedValue(screenshotData);

    // Simulate a cookie-reject button with matching text
    const mockButtonHandle = makeMockButtonHandle("Reject All");
    mockPage.$$.mockResolvedValue([mockButtonHandle]);

    appTest.ctx.puppeteer.getBrowserFirstPage.mockReturnValueOnce(
      fp.TE.right(mockPage),
    );

    const result = await pipe(takeURLScreenshot(url)(appTest.ctx), throwTE);

    expect(mockButtonHandle.click).toHaveBeenCalled();
    expect(Buffer.isBuffer(result)).toBe(true);
  }, 10000);
});
