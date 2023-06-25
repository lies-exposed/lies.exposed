import { s3Mock } from "../__mocks__/s3.mock";
import puppeteerMock from "../__mocks__/puppeteer.mock";
import { tgProviderMock } from "../__mocks__/tg.mock";

export interface AppMocks {
  tg: typeof tgProviderMock;
  s3: typeof s3Mock;
  urlMetadata: {
    fetchHTML: vi.Mock<any, any>;
    fetchMetadata: vi.Mock<any, any>;
  };
  puppeteer: typeof puppeteerMock;
}

export const fetchHTML = vi.fn();
export const fetchMetadata = vi.fn();

export const mocks: AppMocks = {
  tg: tgProviderMock,
  s3: s3Mock,
  urlMetadata: {
    fetchHTML: fetchHTML as any,
    fetchMetadata: fetchMetadata as any,
  },
  puppeteer: puppeteerMock,
};
