import { type Mock, vi } from "vitest";
import puppeteerMock from "../__mocks__/puppeteer.mock.js";
import { s3Mock } from "../__mocks__/s3.mock.js";
import { tgProviderMock } from "../__mocks__/tg.mock.js";

export interface AppMocks {
  axios: typeof axiosMock;
  tg: typeof tgProviderMock;
  s3: typeof s3Mock;
  urlMetadata: {
    fetchHTML: Mock<any, any>;
    fetchMetadata: Mock<any, any>;
  };
  puppeteer: typeof puppeteerMock;
}

export const fetchHTML = vi.fn();
export const fetchMetadata = vi.fn();

export const axiosMock =  {
  get: vi.fn()
}

export const mocks: AppMocks = {
  axios: axiosMock,
  tg: tgProviderMock,
  s3: s3Mock,
  urlMetadata: {
    fetchHTML: fetchHTML as any,
    fetchMetadata: fetchMetadata as any,
  },
  puppeteer: puppeteerMock,
};
