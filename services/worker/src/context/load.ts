import fs from "fs";
import { createS3ProviderConfig } from "@liexp/backend/lib/providers/space/creates3ProviderConfig.js";
import {
  getDataSource,
  getORMConfig,
} from "@liexp/backend/lib/utils/data-source.js";
import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { ENVParser } from "@liexp/shared/lib/utils/env.utils.js";
import axios from "axios";
import { Schema } from "effect";
import Ffmpeg from "fluent-ffmpeg";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import Redis from "ioredis";
import MW from "nodemw";
import metadataParser from "page-metadata-parser";
import * as pdfJs from "pdfjs-dist/legacy/build/pdf.mjs";
import * as pup from "puppeteer-core";
import { addExtra, type VanillaPuppeteer } from "puppeteer-extra";
import puppeteerStealth from "puppeteer-extra-plugin-stealth";
import sharp from "sharp";
import WinkFn from "wink-nlp";
import { type WorkerContext } from "./context.js";
import { type ContextImplementation, makeContext } from "./make.js";
import { ENV } from "#io/env.js";
import { type WorkerError } from "#io/worker.error.js";

export const loadImplementation = (env: ENV): ContextImplementation => {
  const p = addExtra(pup as any);
  p.use(puppeteerStealth());
  return {
    redis: {
      client: new Redis({
        lazyConnect: true,
      }),
    },
    pdf: {
      client: pdfJs,
    },
    imgProc: {
      client: () => Promise.resolve(sharp),
    },
    ner: {
      nlp: {
        client: WinkFn,
      },
    },
    puppeteer: {
      client: p as any as VanillaPuppeteer,
    },
    ffmpeg: {
      client: Ffmpeg,
    },
    urlMetadata: {
      client: axios.create(),
      parser: {
        getMetadata: metadataParser.getMetadata,
      },
    },
    wp: {
      wiki: new MW({
        protocol: "https",
        server: "en.wikipedia.org",
        path: "/w",
        debug: true,
        concurrency: 5,
      }),
      http: axios.create({
        baseURL: "https://en.wikipedia.org/api/rest_v1",
      }),
    },
    rw: {
      wiki: new MW({
        protocol: "https",
        server: "rationalwiki.org",
        path: "/w",
        debug: true,
        concurrency: 5,
      }),
      http: axios.create({
        baseURL: "https://rationalwiki.org/api/rest_v1",
      }),
    },
    http: {
      client: axios.create(),
    },
    geo: {
      client: axios.create({ baseURL: env.GEO_CODE_BASE_URL }),
    },
    space: createS3ProviderConfig(env),
    db: { client: getDataSource(getORMConfig(env, false)) },
    fs: { client: fs },
  };
};

export const loadContext = (): TE.TaskEither<WorkerError, WorkerContext> => {
  return pipe(
    loadAndParseENV(ENVParser(Schema.decodeUnknownEither(ENV)))(process.cwd()),
    TE.fromEither,
    TE.chain((env) => makeContext(env, loadImplementation(env))),
  );
};
