import { type Browser, type Page } from "puppeteer-core";
import { type VanillaPuppeteer } from "puppeteer-extra";
import { type Mock, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";

const puppeteerMock: MockProxy<Partial<VanillaPuppeteer>> = mock({
  use: vi.fn().mockReturnThis(),
  launch: vi.fn(() => {
    return Promise.resolve(browserMock);
  }),
});

const pageMock: MockProxy<Partial<Page>> = mock({
  on: vi.fn(() => {
    throw new Error("Not implemented");
  }),
  goto: vi.fn(() => {
    throw new Error("goto not implemented");
  }),
  click: vi.fn(() => {
    throw new Error("click not implemented");
  }),
  waitForSelector: vi.fn(() => {
    throw new Error("goto not implemented");
  }),
  $: vi.fn(() => {
    throw new Error("goto not implemented");
  }),
  $$: vi.fn(() => {
    throw new Error("goto not implemented");
  }),
  $eval: vi.fn(() => {
    throw new Error("goto not implemented");
  }),
  $x: vi.fn(() => {
    throw new Error("goto not implemented");
  }),
  evaluate: vi.fn(() => {
    throw new Error("goto not implemented");
  }),
  evaluateHandle: vi.fn(() => {
    throw new Error("goto not implemented");
  }),
  waitForTimeout: vi.fn().mockImplementation((ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms / 10);
    });
  }),
  emulate: vi.fn(() => {
    throw new Error("goto not implemented");
  }),
  screenshot: vi.fn(() => {
    throw new Error("goto not implemented");
  }),
  browser: vi.fn(() => browserMock as unknown as Browser),
});

const browserMock: MockProxy<
  Partial<
    Omit<Browser, "newPage" | "pages"> & {
      newPage: Mock<() => Promise<typeof pageMock>>;
      pages: Mock<() => Promise<(typeof pageMock)[]>>;
    }
  >
> = mock({
  on: vi.fn(() => {
    throw new Error("Not implemented");
  }),
  newPage: vi.fn(() => Promise.resolve(pageMock)),
  pages: vi.fn(() => Promise.resolve([pageMock])),
  close: vi.fn(() => Promise.resolve(undefined)),
});

const mocks = {
  ...puppeteerMock,
  page: pageMock,
  browser: browserMock,
  devices: {
    "iPhone 13 Pro": {},
  },
};

export default mocks;
