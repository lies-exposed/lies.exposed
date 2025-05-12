import {
  type Axios,
  type AxiosInterceptorManager,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { type Mock, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { dbMock } from "./mocks/db.mock.js";
import { exifRMock } from "./mocks/exifreader.mock.js";
import ffmpegMock from "./mocks/ffmpeg.mock.js";
import { fsMock } from "./mocks/fs.mock.js";
import { igProviderMock } from "./mocks/ig.mock.js";
import NLPMock from "./mocks/nlp.mock.js";
import { pdfJsMock } from "./mocks/pdfjs.mock.js";
import puppeteerMock from "./mocks/puppeteer.mock.js";
import { queueFSMock } from "./mocks/queue.mock.js";
import { redisMock } from "./mocks/redis.mock.js";
import { s3Mock } from "./mocks/s3.mock.js";
import sharpMock from "./mocks/sharp.mock.js";
import { tgProviderMock } from "./mocks/tg.mock.js";
import { wikipediaProviderMock } from "./mocks/wikipedia.mock.js";

export interface DepsMocks {
  axios: typeof axiosMock;
  fs: typeof fsMock;
  ffmpeg: typeof ffmpegMock;
  ner: NLPMock;
  db: typeof dbMock;
  tg: typeof tgProviderMock;
  ig: typeof igProviderMock;
  s3: typeof s3Mock;
  wiki: typeof wikipediaProviderMock;
  redis: typeof redisMock;
  urlMetadata: {
    fetchHTML: Mock<any>;
    fetchMetadata: Mock<any>;
  };
  puppeteer: typeof puppeteerMock;
  exifR: typeof exifRMock;
  sharp: typeof sharpMock;
  queueFS: typeof queueFSMock;
  pdf: typeof pdfJsMock;
}

const fetchHTML = vi.fn();
const fetchMetadata = vi.fn();

export const axiosMock = mock<Axios>({
  get: vi.fn(),
  interceptors: mock({
    request: mock<AxiosInterceptorManager<InternalAxiosRequestConfig>>(),
    response: mock<AxiosInterceptorManager<AxiosResponse>>(),
  }),
});

export const mocks: DepsMocks = {
  fs: fsMock,
  wiki: wikipediaProviderMock,
  axios: axiosMock,
  ffmpeg: ffmpegMock,
  db: dbMock,
  tg: tgProviderMock,
  ig: igProviderMock,
  s3: s3Mock,
  urlMetadata: {
    fetchHTML: fetchHTML,
    fetchMetadata: fetchMetadata,
  },
  redis: redisMock,
  puppeteer: puppeteerMock,
  ner: NLPMock as any,
  sharp: sharpMock,
  exifR: exifRMock,
  queueFS: queueFSMock,
  pdf: pdfJsMock,
};
