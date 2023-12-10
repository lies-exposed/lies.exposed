import type { PuppeteerExtra } from "puppeteer-extra";
import type { Mocked } from "vitest";
vi.mock("puppeteer-core", () => ({}));
vi.mock("puppeteer-extra", () => ({}));

const puppeteerMock = {
  use: vi.fn(),
  launch: vi.fn(),
} as any as Mocked<PuppeteerExtra>;

export const pageMock = {
  on: vi.fn(),
  goto: vi.fn().mockRejectedValue(new Error("goto not implemented")),
  click: vi.fn().mockRejectedValue(new Error("click: Not implemented")),
  waitForSelector: vi
    .fn()
    .mockRejectedValue(new Error(`waitForSelector: Not implemented`)),
  $: vi.fn().mockRejectedValue(new Error(`$: Not implemented`)),
  $$: vi.fn().mockRejectedValue(new Error(`$: Not implemented`)),
  $eval: vi.fn().mockRejectedValue(new Error(`$eval: Not implemented`)),
  $x: vi.fn().mockRejectedValue(new Error(`$x: Not implemented`)),
  evaluate: vi.fn().mockRejectedValue(new Error(`evaluate: Not implemented`)),
  evaluateHandle: vi
    .fn()
    .mockRejectedValue(new Error(`evaluateHandle: Not implemented`)),
  waitForTimeout: vi.fn().mockImplementation((ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms / 10);
    });
  }),
  emulate: vi.fn().mockRejectedValue(new Error(`emulate: Not implemented`)),
  screenshot: vi.fn().mockRejectedValue(new Error(`screenshot: Not implemented`)),
  browser: () => browserMock,
};

export const browserMock = {
  on: vi.fn(),
  pages: vi.fn().mockResolvedValue([pageMock] as any),
  close: vi.fn().mockResolvedValue(undefined),
};

puppeteerMock.use.mockImplementation((fn) => puppeteerMock);
puppeteerMock.launch.mockImplementation(() => {
  return Promise.resolve(browserMock) as any;
});

export default { ...puppeteerMock, page: pageMock, browser: browserMock };
