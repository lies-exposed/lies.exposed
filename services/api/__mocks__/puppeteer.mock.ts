/* eslint-disable import/first */
jest.mock("puppeteer-extra");
import puppeteer, { PuppeteerExtra } from "puppeteer-extra";

const puppeteerMock = puppeteer as jest.Mocked<PuppeteerExtra>;

export const pageMock = {
  on: jest.fn(),
  goto: jest.fn().mockRejectedValue(new Error("goto not implemented")),
  click: jest.fn().mockRejectedValue(new Error("click: Not implemented")),
  waitForSelector: jest
    .fn()
    .mockRejectedValue(new Error(`waitForSelector: Not implemented`)),
  $: jest.fn().mockRejectedValue(new Error(`$: Not implemented`)),
  $eval: jest.fn().mockRejectedValue(new Error(`$eval: Not implemented`)),
  $x: jest.fn().mockRejectedValue(new Error(`$x: Not implemented`)),
  evaluate: jest.fn().mockRejectedValue(new Error(`evaluate: Not implemented`)),
  evaluateHandle: jest
    .fn()
    .mockRejectedValue(new Error(`evaluateHandle: Not implemented`)),
  waitForTimeout: jest.fn().mockImplementation((ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms / 10);
    });
  }),
  browser: () => browserMock,
};

export const browserMock = {
  on: jest.fn(),
  pages: jest.fn().mockResolvedValue([pageMock] as any),
  close: jest.fn().mockResolvedValue(undefined),
};

puppeteerMock.use.mockImplementation((fn) => puppeteerMock);
puppeteerMock.launch.mockImplementation(() => {
  return Promise.resolve(browserMock) as any;
});

export default { ...puppeteerMock, page: pageMock, browser: browserMock };
