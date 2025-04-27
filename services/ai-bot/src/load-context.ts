import * as fs from "fs";
import * as path from "path";
import {
  type AvailableModels,
  GetLangchainProvider,
} from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { GetOpenAIProvider } from "@liexp/shared/lib/providers/openai/openai.provider.js";
import { PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { GetResourceClient } from "@ts-endpoint/resource-client";
import * as axios from "axios";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import * as pdf from "pdfjs-dist/legacy/build/pdf.mjs";
import { AIBotConfig } from "./config.js";
import { type ClientContext } from "./context.js";
import { parseENV } from "./env.js";
import { ConfigProviderReader } from "#common/config/config.reader.js";
import { type AIBotError } from "#common/error/index.js";

const configFile = path.resolve(process.cwd(), "ai-bot.config.json");
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
    fp.TE.bind("config", ({ fs }) => configProvider({ fs })),
    fp.TE.bind("langchain", ({ config }) =>
      fp.TE.right(
        GetLangchainProvider({
          baseURL: config.config.localAi.url,
          apiKey: config.config.localAi.apiKey,
          models: {
            chat: config.config.localAi.models?.chat as AvailableModels,
            embeddings: config.config.localAi.models
              ?.embeddings as AvailableModels,
          },
        }),
      ),
    ),
    fp.TE.bind("openAI", ({ config }) =>
      fp.TE.right(
        GetOpenAIProvider({
          baseURL: config.config.localAi.url,
          apiKey: config.config.localAi.apiKey,
          timeout: 20 * 60_000, // 20 minutes
        }),
      ),
    ),
    fp.TE.map(({ env, config, fs, langchain, openAI }) => {
      const logger = GetLogger("ai-bot");

      const restClient = axios.default.create({
        baseURL: config.config.api.url,
      });

      restClient.interceptors.request.use((req) => {
        const token = getToken();
        if (token) {
          req.headers.set("Authorization", `Bearer ${getToken()}`);
        }
        return req;
      });

      const apiClient = GetResourceClient(restClient, Endpoints, {
        decode: EffectDecoder((e) =>
          DecodeError.of("Resource client decode error", e),
        ),
      });

      logger.info.log("API url %s", config.config.api.url);
      logger.info.log("OpenAI url %s", config.config.localAi.url);

      return {
        env,
        fs,
        config,
        http: HTTPProvider(axios.default.create({})),
        pdf: PDFProvider({ client: pdf }),
        logger,
        apiRESTClient: restClient,
        endpointsRESTClient: apiClient,
        langchain,
        openAI,
      };
    }),
  );
