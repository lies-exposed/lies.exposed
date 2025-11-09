import {
  type Axios,
  type AxiosInterceptorManager,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { vi } from "vitest";
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

const fetchHTML = vi
  .fn<(url: string, opts: any) => Promise<string>>()
  .mockResolvedValue("<html><body><h1>Example Article</h1></body></html>");

const fetchMetadata = vi
  .fn<(url: string, opts: any) => Promise<any>>()
  .mockResolvedValue({
    title: "Example Article",
    description: "An example article used in tests",
    url: "https://example.com/article/1",
    images: [],
  });

export interface DepsMocks {
  axios: typeof axiosMock;
  fs: typeof fsMock;
  ffmpeg: typeof ffmpegMock;
  ner: typeof NLPMock;
  db: typeof dbMock;
  tg: typeof tgProviderMock;
  ig: typeof igProviderMock;
  s3: typeof s3Mock;
  wiki: typeof wikipediaProviderMock;
  redis: typeof redisMock;
  urlMetadata: {
    fetchHTML: typeof fetchHTML;
    fetchMetadata: typeof fetchMetadata;
  };
  puppeteer: typeof puppeteerMock;
  exifR: typeof exifRMock;
  sharp: typeof sharpMock;
  queueFS: typeof queueFSMock;
  pdf: typeof pdfJsMock;
}

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
  ner: NLPMock,
  sharp: sharpMock,
  exifR: exifRMock,
  queueFS: queueFSMock,
  pdf: pdfJsMock,
};
