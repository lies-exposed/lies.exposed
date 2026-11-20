import { type Browser, type Page } from "puppeteer-core";
import { type VanillaPuppeteer } from "puppeteer-extra";
import { vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";

const puppeteerMock: MockProxy<Partial<VanillaPuppeteer>> = mock({
  use: vi.fn().mockReturnThis(),
  launch: vi.fn(() => {
    return Promise.resolve(browserMock);
  }),
});

type PageBase = Partial<Omit<Page, "browser">>;
type BrowserBase = Partial<Omit<Browser, "newPage" | "pages">>;

export type PuppeteerPageMock = MockProxy<PageBase> & {
  browser: () => PuppeteerBrowserMock;
};

export type PuppeteerBrowserMock = MockProxy<BrowserBase> & {
  newPage: () => Promise<PuppeteerPageMock>;
  pages: () => Promise<PuppeteerPageMock[]>;
};

const pageMock: PuppeteerPageMock = Object.assign(
  mock<PageBase>({
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
    evaluate: vi.fn(() => {
      throw new Error("goto not implemented");
    }),
    evaluateHandle: vi.fn(() => {
      throw new Error("goto not implemented");
    }),
    emulate: vi.fn(() => {
      throw new Error("goto not implemented");
    }),
    screenshot: vi.fn(() => {
      throw new Error("goto not implemented");
    }),
  }),
  { browser: vi.fn(() => browserMock) },
);

const browserMock: PuppeteerBrowserMock = Object.assign(
  mock<BrowserBase>({
    on: vi.fn(() => {
      throw new Error("Not implemented");
    }),
    close: vi.fn(() => Promise.resolve(undefined)),
  }),
  {
    newPage: vi.fn(() => Promise.resolve(pageMock)),
    pages: vi.fn(() => Promise.resolve([pageMock])),
  },
);

const mocks = {
  ...puppeteerMock,
  page: pageMock,
  browser: browserMock,
  devices: {
    "iPhone 13 Pro": {},
  },
};

export default mocks;
