import { type Mock, vi } from "vitest";
import { igProviderMock } from './__mocks__/ig.mock.js';
import puppeteerMock from "./__mocks__/puppeteer.mock.js";
import { s3Mock } from "./__mocks__/s3.mock.js";
import { sharpMock } from './__mocks__/sharp.mock.js';
import { tgProviderMock } from "./__mocks__/tg.mock.js";
import { wikipediaProviderMock } from './__mocks__/wikipedia.mock.js';

export interface AppMocks {
  axios: typeof axiosMock;
  tg: typeof tgProviderMock;
  ig: typeof igProviderMock;
  s3: typeof s3Mock;
  wiki: typeof wikipediaProviderMock
  urlMetadata: {
    fetchHTML: Mock<any, any>;
    fetchMetadata: Mock<any, any>;
  };
  puppeteer: typeof puppeteerMock;
  sharp: typeof sharpMock
}

export const fetchHTML = vi.fn();
export const fetchMetadata = vi.fn();

export const axiosMock =  {
  get: vi.fn()
}

export const mocks: AppMocks = {
  wiki: wikipediaProviderMock,
  axios: axiosMock,
  tg: tgProviderMock,
  ig: igProviderMock,
  s3: s3Mock,
  urlMetadata: {
    fetchHTML: fetchHTML as any,
    fetchMetadata: fetchMetadata as any,
  },
  puppeteer: puppeteerMock,
  sharp: sharpMock
};
