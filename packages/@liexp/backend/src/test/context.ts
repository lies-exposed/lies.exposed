import { GetLogger } from "@liexp/core";
import { type DeepMockProxy } from "vitest-mock-extended";
import { type ConfigContext } from "../context/config.context.js";
import { type DatabaseContext } from "../context/db.context.js";
import { type ENVContext } from "../context/env.context.js";
import { type FFMPEGProviderContext } from "../context/ffmpeg.context.js";
import { type FSClientContext } from "../context/fs.context.js";
import { type HTTPProviderContext } from "../context/http.context.js";
import {
  type ImgProcClientContext,
  type NERProviderContext,
  type TGBotProviderContext,
} from "../context/index.js";
import { type LoggerContext } from "../context/logger.context.js";
import { type PDFProviderContext } from "../context/pdf.context.js";
import { type PuppeteerProviderContext } from "../context/puppeteer.context.js";
import { type QueuesProviderContext } from "../context/queue.context.js";
import { type SpaceContext } from "../context/space.context.js";
import { type URLMetadataContext } from "../context/urlMetadata.context.js";
import { testConfig } from "./testConfig.js";

export type TestContext = PDFProviderContext &
  TGBotProviderContext &
  LoggerContext &
  DatabaseContext &
  PuppeteerProviderContext &
  ConfigContext &
  FSClientContext &
  NERProviderContext &
  URLMetadataContext &
  HTTPProviderContext &
  ImgProcClientContext &
  SpaceContext &
  QueuesProviderContext &
  FFMPEGProviderContext;

export type MockedContext<C extends Record<string, any>> = {
  [K in keyof C]: DeepMockProxy<C[K]>;
};

export const mockedContext = <C extends Record<string, any>>(
  ctx: MockedContext<Omit<C, "logger" | "config" | "env">>,
): MockedContext<Omit<C, "logger" | "config" | "env">> &
  LoggerContext &
  ConfigContext &
  ENVContext => ({
  ...ctx,
  env: process.env as any,
  logger: GetLogger("test"),
  config: testConfig,
});
