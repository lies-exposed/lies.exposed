import fs from "fs";
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
  (delay: number, retries: number, action: string): ClientContextRTE<void> =>
  (ctx) => {
    const newDelay = delay * Math.pow(2, retries);

    return fp.TE.tryCatch(() => {
      ctx.logger.debug.log(
        "Retrying (%d) %s in %ds",
        retries,
        action,
        newDelay / 1000,
      );
      return new Promise((resolve) => setTimeout(resolve, newDelay));
    }, toAIBotError);
  };

let waitForLoginRetry = 0;
const waitForLogin = (): ClientContextRTE<string> => {
  return pipe(
    userLogin(),
    fp.RTE.orElse(() =>
      pipe(
        exponentialWait(10000, waitForLoginRetry++, "login"),
        fp.RTE.chain(waitForLogin),
      ),
    ),
  );
};

let waitForLocalAIRetry = 0;
const waitForLocalAI = (): ClientContextRTE<void> => (ctx) => {
  return pipe(
    fp.TE.tryCatch(
      () =>
        ctx.openAI.client.models
          .list()
          .asResponse()
          .then((r) => r.json()),
      toAIBotError,
    ),
    fp.TE.orElse((e) => {
      ctx.logger.error.log("Error getting OpenAI models %O", e);

      return fp.TE.right({ data: [] });
    }),
    fp.TE.map((r) => r.data.map((m: { id: string }) => m.id)),
    LoggerService.TE.debug(ctx, "OpenAI models %O"),
    fp.TE.chain((models) => {
      if (models.length === 0) {
        return pipe(
          exponentialWait(10000, waitForLocalAIRetry++, "waitForLocalAI"),
          fp.RTE.chain(waitForLocalAI),
        )(ctx);
      }
      return fp.TE.right(undefined);
    }),
  );
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
            exponentialWait(10000, retry, "run:failed"),
            fp.RTE.chain(() => go(retry + 1)),
          );
        },
        () =>
          pipe(
            exponentialWait(10000, 0, "run:finish"),
            fp.RTE.chain(() => go(0)),
          ),
      ),
    );

  return pipe(
    waitForLogin(),
    fp.RTE.map((t) => {
      token = t;
      return token;
    }),
    fp.RTE.chainFirst(waitForLocalAI),
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
  fp.TE.bind("fs", () => fp.TE.right(GetFSClient({ client: fs }))),
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

    const restClient = APIRESTClient({
      getAuth: () => {
        return token;
      },
      url: config.config.api.url,
    });
    const apiClient = fromEndpoints(restClient)(Endpoints);

    logger.info.log("API url %s", config.config.api.url);
    logger.info.log("OpenAI url %s", config.config.localAi.url);

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
      openAI,
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
