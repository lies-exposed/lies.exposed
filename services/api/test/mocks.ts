import { type Mock, vi } from "vitest";
import { igProviderMock } from "./__mocks__/ig.mock.js";
import NLPMock from "./__mocks__/nlp.mock.js";
import puppeteerMock from "./__mocks__/puppeteer.mock.js";
import { s3Mock } from "./__mocks__/s3.mock.js";
import sharpMock from "./__mocks__/sharp.mock.js";
import { tgProviderMock } from "./__mocks__/tg.mock.js";
import { wikipediaProviderMock } from "./__mocks__/wikipedia.mock.js";
import { exifRMock } from "./__mocks__/exifreader.mock.js";
import ffmpegMock from "./__mocks__/ffmpeg.mock.js";
import { queueFSMock } from './__mocks__/queue.mock.js';

export interface AppMocks {
  axios: typeof axiosMock;
  ffmpeg: typeof ffmpegMock;
  ner: NLPMock;
  tg: typeof tgProviderMock;
  ig: typeof igProviderMock;
  s3: typeof s3Mock;
  wiki: typeof wikipediaProviderMock;
  redis: { publish: Mock<any>; subscribe: Mock<any> };
  urlMetadata: {
    fetchHTML: Mock<any>;
    fetchMetadata: Mock<any>;
  };
  puppeteer: typeof puppeteerMock;
  exifR: typeof exifRMock;
  sharp: typeof sharpMock;
  queueFS: typeof queueFSMock;
}

const fetchHTML = vi.fn();
const fetchMetadata = vi.fn();

export const axiosMock = {
  get: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn(),
    },
  },
};

export const mocks: AppMocks = {
  wiki: wikipediaProviderMock,
  axios: axiosMock,
  ffmpeg: ffmpegMock,
  tg: tgProviderMock,
  ig: igProviderMock,
  s3: s3Mock,
  urlMetadata: {
    fetchHTML: fetchHTML as any,
    fetchMetadata: fetchMetadata as any,
  },
  redis: {
    publish: vi.fn().mockResolvedValue(1),
    subscribe: vi.fn().mockResolvedValue(undefined),
  },
  puppeteer: puppeteerMock,
  ner: NLPMock as any,
  sharp: sharpMock,
  exifR: exifRMock,
  queueFS: queueFSMock,
};
