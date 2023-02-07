import { awsMock } from "../__mocks__/aws.mock";
import puppeteerMock from "../__mocks__/puppeteer.mock";
import { tgProviderMock } from "../__mocks__/tg.mock";

export interface AppMocks {
  tg: typeof tgProviderMock;
  s3: typeof awsMock;
  urlMetadata: {
    fetchHTML: jest.Mock<any, any>;
    fetchMetadata: jest.Mock<any, any>;
  };
  puppeteer: typeof puppeteerMock;
}

export const fetchHTML = jest.fn();
export const fetchMetadata = jest.fn();

export const mocks: AppMocks = {
  tg: tgProviderMock,
  s3: awsMock,
  urlMetadata: {
    fetchHTML: fetchHTML as any,
    fetchMetadata: fetchMetadata as any,
  },
  puppeteer: puppeteerMock,
};
