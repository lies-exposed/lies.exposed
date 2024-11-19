import path from "path";
import {
  type AvailableModels,
  GetLangchainProvider,
} from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { fromEndpoints } from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import { APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { GetOpenAIProvider } from "@liexp/shared/lib/providers/openai/openai.provider.js";
import { PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import axios from "axios";
import * as pdf from "pdfjs-dist/legacy/build/pdf.mjs";
import { AIBotConfig } from "./config.js";
import { parseENV } from "./env.js";
import { type ClientContextRTE } from "./types.js";
import { ConfigProviderReader } from "#common/config/config.reader.js";
import { report, toAIBotError } from "#common/error/index.js";
import { clearToken } from "#flows/clearToken.flow.js";
import { processOpenAIQueue } from "#flows/processOpenAIQueue.flow.js";
import { userLogin } from "#flows/userLogin.flow.js";

let token: string | null = null;

const exponentialWait =
  (delay: number, retries: number): ClientContextRTE<void> =>
  (ctx) => {
    const newDelay = delay * Math.pow(2, retries);

    return fp.TE.tryCatch(() => {
      ctx.logger.info.log("Retrying in %d s", newDelay / 1000);
      return new Promise((resolve) => setTimeout(resolve, newDelay));
    }, toAIBotError);
  };

const run = (dryRun: boolean): ClientContextRTE<void> => {
  const go = (retry: number): ClientContextRTE<void> =>
    pipe(
      processOpenAIQueue(dryRun),
      fp.RTE.fold(
        (e) => {
          if (e.status === 401) {
            return pipe(
              clearToken,
              fp.RTE.chain(() => run(dryRun)),
            );
          }
          return pipe(
            exponentialWait(10000, retry),
            fp.RTE.chain(() => go(retry + 1)),
          );
        },
        () =>
          pipe(
            exponentialWait(10000, 0),
            fp.RTE.chain(() => go(0)),
          ),
      ),
    );

  return pipe(
    userLogin(),
    fp.RTE.map((t) => {
      token = t;
      return token;
    }),
    fp.RTE.chainFirst(() => (ctx) => {
      return pipe(
        fp.TE.tryCatch(
          () =>
            ctx.openAI.models
              .list()
              .asResponse()
              .then((r) => r.json()),
          toAIBotError,
        ),
        fp.TE.map((r) => r.data.map((m: { id: string }) => m.id)),
        LoggerService.TE.debug(ctx, "OpenAI models %O"),
        fp.RTE.fromTaskEither,
      )(ctx);
    }),
    fp.RTE.chain(() => go(0)),
  );
};

const configFile = path.resolve(process.cwd(), "ai-bot.config.json");
const configProvider = ConfigProviderReader<AIBotConfig>(
  configFile,
  AIBotConfig,
);

const dryRun = false;

void pipe(
  fp.TE.Do,
  fp.TE.bind("env", () =>
    pipe(loadAndParseENV(parseENV)(process.cwd()), fp.TE.fromEither),
  ),
  fp.TE.bind("fs", () => fp.TE.right(GetFSClient())),
  fp.TE.bind("config", ({ fs }) => configProvider({ fs })),
  fp.TE.bind("langchain", ({ config }) =>
    fp.TE.right(
      GetLangchainProvider({
        baseURL: config.config.localAi.url,
        apiKey: config.config.localAi.apiKey,
        models: {
          chat: config.config.localAi.models?.summarization as AvailableModels,
          embeddings: config.config.localAi.models
            ?.embeddings as AvailableModels,
        },
      }),
    ),
  ),
  fp.TE.map(({ env, config, fs, langchain }) => {
    const logger = GetLogger("ai-bot");

    const restClient = APIRESTClient({
      getAuth: () => {
        return token;
      },
      url: config.config.api.url,
    });
    const apiClient = fromEndpoints(restClient)(Endpoints);

    return {
      env,
      fs,
      config,
      http: HTTPProvider(axios.create({})),
      pdf: PDFProvider({ client: pdf }),
      logger,
      apiRESTClient: restClient,
      endpointsRESTClient: apiClient,
      langchain,
      openAI: GetOpenAIProvider({
        baseURL: config.config.localAi.url,
        apiKey: config.config.localAi.apiKey,
      }),
    };
  }),
  fp.TE.chain(run(dryRun)),
  fp.TE.mapLeft(report),
  throwTE,
)
  .then((r) => {
    // eslint-disable-next-line no-console
    console.log("Success", r);
    process.exit(0);
  })
  .catch((e) => {
    // eslint-disable-next-line
    console.error(e);
    process.exit(1);
  });
