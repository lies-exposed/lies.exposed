import * as fs from "fs";
import * as path from "path";
import { loadPuppeteer } from "@liexp/backend/lib/context/load/puppeteer.load.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import { Endpoints as AgentEndpoints } from "@liexp/shared/lib/endpoints/agent/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { GetResourceClient } from "@ts-endpoint/resource-client";
import * as axios from "axios";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { AIBotConfig } from "./config.js";
import { type ClientContext } from "./context.js";
import { parseENV } from "./env.js";
import { ConfigProviderReader } from "#common/config/config.reader.js";
import { toAIBotError, type AIBotError } from "#common/error/index.js";

const configFile = path.resolve(process.cwd(), "config/ai-bot.config.json");
const configProvider = ConfigProviderReader(configFile, AIBotConfig);

export const loadContext = (
  getToken: () => string | null,
): TaskEither<AIBotError, ClientContext> =>
  pipe(
    fp.TE.Do,
    fp.TE.bind("env", () =>
      pipe(loadAndParseENV(parseENV)(process.cwd()), fp.TE.fromEither),
    ),
    fp.TE.bind("fs", () => fp.TE.right(GetFSClient({ client: fs }))),
    fp.TE.bind("pdf", () => fp.TE.right(PDFProvider({ client: pdfjs }))),
    fp.TE.bind("logger", () => fp.TE.right(GetLogger("ai-bot"))),
    fp.TE.bind("config", ({ fs }) => pipe(configProvider({ fs }))),
    fp.TE.bind("puppeteer", () =>
      pipe(
        fp.TE.tryCatch(() => loadPuppeteer(), toAIBotError),
        fp.TE.map(({ client, KnownDevices }) =>
          GetPuppeteerProvider(
            client,
            {
              headless: true,
            },
            KnownDevices,
          ),
        ),
      ),
    ),

    fp.TE.bind("apiRestClient", ({ config }) =>
      fp.TE.right(
        axios.default.create({
          baseURL: config.config.api.url,
        }),
      ),
    ),
    fp.TE.bind("api", ({ apiRestClient }) =>
      fp.TE.right(
        GetResourceClient(apiRestClient, Endpoints, {
          decode: EffectDecoder((e) =>
            DecodeError.of("Resource client decode error", e),
          ),
        }),
      ),
    ),
    fp.TE.bind("agent", ({ config, env }) =>
      fp.TE.right(
        GetResourceClient(
          axios.default.create({
            baseURL: config.config.agent.url,
            headers: {
              Authorization: `Bearer ${env.AGENT_API_KEY}`,
            },
          }),
          AgentEndpoints,
          {
            decode: EffectDecoder((e) =>
              DecodeError.of("Agent client decode error", e),
            ),
          },
        ),
      ),
    ),
    fp.TE.bind("token", ({ env, logger }) =>
      pipe(
        env.API_TOKEN,
        fp.O.fold(
          () =>
            fp.TE.left(
              toAIBotError(
                "API_TOKEN environment variable is required but not set",
              ),
            ),
          (token) => {
            logger.debug.log("Using API_TOKEN from environment");
            return fp.TE.right(token);
          },
        ),
      ),
    ),
    fp.TE.map(
      ({
        env,
        config,
        fs,
        pdf,
        puppeteer,
        logger,
        apiRestClient,
        api,
        agent,
      }) => {
        apiRestClient.interceptors.request.use((req) => {
          const token = getToken();
          if (token) {
            req.headers.set("Authorization", `Bearer ${getToken()}`);
          }
          return req;
        });

        logger.info.log("AI BOT config %O", config.config);

        return {
          env,
          fs,
          config,
          http: HTTPProvider(axios.default.create({})),
          pdf,
          logger,
          api,
          agent,
          puppeteer,
        };
      },
    ),
  );
