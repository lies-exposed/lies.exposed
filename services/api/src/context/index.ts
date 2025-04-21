import * as fs from "fs";
import * as path from "path";
import { MakeURLMetadata } from "@liexp/backend/lib/providers/URLMetadata.provider.js";
import { GetFFMPEGProvider } from "@liexp/backend/lib/providers/ffmpeg/ffmpeg.provider.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GeocodeProvider } from "@liexp/backend/lib/providers/geocode/geocode.provider.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetNERProvider } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { GetTypeORMClient } from "@liexp/backend/lib/providers/orm/index.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import { createS3ProviderConfig } from "@liexp/backend/lib/providers/space/creates3ProviderConfig.js";
import { MakeSpaceProvider } from "@liexp/backend/lib/providers/space/space.provider.js";
import { WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import {
  getDataSource,
  getORMConfig,
} from "@liexp/backend/lib/utils/data-source.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { editor } from "@liexp/shared/lib/providers/blocknote/ssr.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { GetResourceClient } from "@ts-endpoint/resource-client";
import * as axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { Redis } from "ioredis";
import MW from "nodemw";
import * as metadataParser from "page-metadata-parser";
import * as puppeteer from "puppeteer-core";
import { type VanillaPuppeteer } from "puppeteer-extra";
import WinkFn from "wink-nlp";
import { type TEControllerError } from "../types/TEControllerError.js";
import { type ServerContext } from "./context.type.js";
import { Config } from "#app/config.js";
import { toControllerError } from "#io/ControllerError.js";
import { type ENV } from "#io/ENV.js";

export const makeContext =
  (namespace: string) =>
  (env: ENV): TEControllerError<ServerContext> => {
    const serverLogger = logger.GetLogger(namespace);

    const db = pipe(
      getORMConfig(env, false),
      (opts) =>
        getDataSource({
          ...opts,
          migrations:
            env.NODE_ENV === "test"
              ? undefined
              : [`${process.cwd()}/build/migrations/*.js`],
        }),
      fp.TE.chain(GetTypeORMClient),
      fp.TE.mapLeft(toControllerError),
    );

    const wpProvider = WikipediaProvider({
      logger: serverLogger.extend("mw"),
      client: new MW({
        protocol: "https",
        server: "en.wikipedia.org",
        path: "/w",
        debug: true,
        concurrency: 5,
      }),
      restClient: axios.default.create({
        baseURL: "https://en.wikipedia.org/api/rest_v1",
      }),
    });

    const rationalWikiProvider = WikipediaProvider({
      logger: serverLogger.extend("mw"),
      client: new MW({
        protocol: "https",
        server: "rationalwiki.org",
        path: "/w",
        debug: true,
        concurrency: 5,
      }),
      restClient: axios.default.create({
        baseURL: "https://rationalwiki.org/api/rest_v1",
      }),
    });

    const fsClient = GetFSClient({ client: fs });

    const jwtClient = GetJWTProvider({
      secret: env.JWT_SECRET,
      logger: serverLogger,
    });

    const urlMetadataClient = MakeURLMetadata({
      client: axios.default.create({}),
      parser: {
        getMetadata: metadataParser.getMetadata,
      },
    });

    const client = axios.default.create({
      baseURL: `http://${env.SERVER_HOST}${env.SERVER_PORT ? `:${env.SERVER_PORT}` : ""}`,
    });

    client.interceptors.request.use((req) => {
      req.headers.set(
        "Authorization",
        `Bearer ${jwtClient.signUser({} as any)}`,
      );

      return req;
    });

    const apiClient = GetResourceClient(client, Endpoints, {
      decode: EffectDecoder((e) =>
        DecodeError.of("Resource client decode error", e),
      ),
    });

    const config = Config(env, process.cwd());

    return pipe(
      sequenceS(fp.TE.ApplicativePar)({
        logger: fp.TE.right(serverLogger),
        db,
        s3: fp.TE.right(MakeSpaceProvider(createS3ProviderConfig(env))),
        fs: fp.TE.right(fsClient),
        jwt: fp.TE.right(jwtClient),
        urlMetadata: fp.TE.right(urlMetadataClient),
        env: fp.TE.right(env),
        blocknote: fp.TE.right(editor),
        puppeteer: fp.TE.right(
          GetPuppeteerProvider(
            puppeteer as any as VanillaPuppeteer,
            {},
            puppeteer.KnownDevices,
          ),
        ),
        ffmpeg: fp.TE.right(GetFFMPEGProvider(ffmpeg)),
        http: fp.TE.right(HTTPProvider(axios.default.create({}))),
        geo: fp.TE.right(
          GeocodeProvider({
            http: HTTPProvider(
              axios.default.create({ baseURL: env.GEO_CODE_BASE_URL }),
            ),
            apiKey: env.GEO_CODE_API_KEY,
          }),
        ),
        wp: fp.TE.right(wpProvider),
        rw: fp.TE.right(rationalWikiProvider),
        queue: fp.TE.right(GetQueueProvider(fsClient, config.dirs.temp.queue)),
        ner: fp.TE.right(
          GetNERProvider({
            logger: logger.GetLogger("ner"),
            entitiesFile: path.resolve(
              process.cwd(),
              "config/nlp/entities.json",
            ),
            nlp: WinkFn,
          }),
        ),
        config: fp.TE.right(config),
        api: fp.TE.right(apiClient),
        redis: pipe(
          fp.TE.tryCatch(async () => {
            const redis = new Redis(6379, env.REDIS_HOST, {
              lazyConnect: true,
            });

            if (env.REDIS_CONNECT) {
              await redis.connect();
            }
            return redis;
          }, toControllerError),
        ),
      }),
      fp.TE.mapLeft((e) => ({
        ...e,
        name: e.name,
        status: 500,
      })),
    );
  };
