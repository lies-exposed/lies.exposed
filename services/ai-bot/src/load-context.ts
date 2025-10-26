import * as fs from "fs";
import * as path from "path";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { loadPuppeteer } from "@liexp/backend/lib/context/load/puppeteer.load.js";
import { GetAgentProvider } from "@liexp/backend/lib/providers/ai/agent.provider.js";
import {
  GetLangchainProvider,
  type AvailableModels,
} from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { GetOpenAIProvider } from "@liexp/shared/lib/providers/openai/openai.provider.js";
import { PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { GetResourceClient } from "@ts-endpoint/resource-client";
import * as axios from "axios";
import { sequenceS } from "fp-ts/lib/Apply.js";
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
    fp.TE.bind("config", ({ fs, env }) =>
      pipe(
        configProvider({ fs }),
        fp.TE.bind("localAIURL", (config) => {
          return pipe(
            env.LOCALAI_URL,
            fp.O.getOrElse(() => config.config.localAi.url),
            fp.TE.right<AIBotError, string>,
          );
        }),
        fp.TE.bind("localAIModelChat", (config) => {
          return pipe(
            env.LOCALAI_MODEL_CHAT,
            fp.O.getOrElse(() => config.config.localAi.models?.chat ?? "gpt-4"),
            fp.TE.right<AIBotError, string>,
          );
        }),
        fp.TE.map(({ localAIURL, localAIModelChat, ...config }) => {
          const {
            config: {
              localAi: { timeout: _timeout, ...localAi },
              ...rest
            },
          } = config;

          const timeout = pipe(
            fp.O.fromNullable(_timeout),
            fp.O.alt(() => env.LOCALAI_TIMEOUT),
            fp.O.getOrElse(() => 3_600 * 2 * 1000), // 2 hours
          );

          return {
            ...config,
            config: {
              ...rest,
              localAi: {
                ...localAi,
                timeout,
                url: localAIURL,
                apiKey: env.LOCALAI_API_KEY,
                models: {
                  ...localAi.models,
                  chat: localAIModelChat,
                },
              },
            },
          };
        }),
      ),
    ),
    fp.TE.bind("localaiHeaders", ({ env }) => {
      return pipe(
        sequenceS(fp.O.Applicative)({
          "CF-Access-Client-Id": env.CF_ACCESS_CLIENT_ID,
          "CF-Access-Client-Secret": env.CF_ACCESS_CLIENT_SECRET,
        }),
        fp.O.getOrElse(() => ({})),
        fp.TE.right<AIBotError, HeadersInit>,
      );
    }),
    fp.TE.bind("headers", ({ localaiHeaders, env }) =>
      fp.TE.right({
        ...localaiHeaders,
        Accept: "application/json",
        "content-type": "application/json",
        Authorization: `Bearer ${env.LOCALAI_API_KEY}`,
        Cookie: `token=${env.LOCALAI_API_KEY}`,
      }),
    ),
    fp.TE.bind("langchain", ({ config, headers }) =>
      fp.TE.right(
        GetLangchainProvider({
          baseURL: config.config.localAi.url,
          apiKey: config.config.localAi.apiKey,
          models: {
            chat: config.config.localAi.models?.chat as AvailableModels,
            embeddings: config.config.localAi.models
              ?.embeddings as AvailableModels,
          },
          options: {
            chat: {
              timeout: config.config.localAi.timeout,
              configuration: {
                defaultHeaders: headers,
                fetchOptions: {
                  headers: headers as any,
                },
              },
            },
            embeddings: {
              timeout: config.config.localAi.timeout,
              configuration: {
                defaultHeaders: headers,
                fetchOptions: {
                  headers: headers as any,
                },
              },
            },
          },
        }),
      ),
    ),
    fp.TE.bind("openAI", ({ config, headers }) =>
      fp.TE.right(
        GetOpenAIProvider({
          baseURL: config.config.localAi.url,
          apiKey: config.config.localAi.apiKey,
          timeout: config.config.localAi.timeout,
          defaultHeaders: headers,
          fetchOptions: {
            headers: headers as any,
          },
        }),
      ),
    ),
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
    fp.TE.bind("agent", ({ langchain, logger, token, config, puppeteer }) =>
      pipe(
        GetAgentProvider({
          mcpClient: new MultiServerMCPClient({
            api: {
              transport: "http",
              url: config.config.api.mcp,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }),
        })({ langchain, logger, puppeteer }),
        fp.TE.mapLeft(toAIBotError),
      ),
    ),
    fp.TE.map(
      ({
        env,
        config,
        fs,
        pdf,
        langchain,
        puppeteer,
        openAI,
        agent,
        logger,
        apiRestClient,
        api,
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
          langchain,
          puppeteer,
          openAI,
          agent,
        };
      },
    ),
  );
