import * as fs from "fs";
import * as path from "path";
import { loadPuppeteer } from "@liexp/backend/lib/context/load/puppeteer.load.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { initSentry } from "@liexp/backend/lib/providers/sentry.provider.js";
import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { AgentEndpoints } from "@liexp/shared/lib/endpoints/agent/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { PDFProvider } from "@liexp/shared/lib/providers/pdf/pdf.provider.js";
import { GetResourceClient } from "@ts-endpoint/resource-client";
import * as axios from "axios";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import * as O from "fp-ts/lib/Option.js";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { AIBotConfig } from "./config.js";
import { type ClientContext } from "./context.js";
import { parseENV } from "./env.js";
import { ConfigProviderReader } from "#common/config/config.reader.js";
import { toAIBotError, type AIBotError } from "#common/error/index.js";

const configFile = path.resolve(process.cwd(), "config/ai-bot.config.json");
const configProvider = ConfigProviderReader(configFile, AIBotConfig);

// Bounds how long a queue job can sit waiting on the agent's chat turn. Without
// this, an agent tool stuck retrying (e.g. a bot-blocked scrape target) never
// resolves the HTTP call, so the job-processor bracket's release step never
// runs and the queue row is orphaned in "processing" indefinitely.
// Default kept >= agent's own LOCALAI_TIMEOUT_MS default (30min) since the
// LocalAI gateway serializes/queues requests and can leave agent waiting
// close to its own timeout before responding.
const DEFAULT_AGENT_REQUEST_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * ZeroClaw adapter for ai-bot (WS7).
 *
 * When ZEROCLOW_ENABLED is true, the ai-bot forwards agent calls to the
 * ZeroClaw webhook instead of the legacy agent service. ZeroClaw exposes
 * MCP tools for actor/group/link via its Paperclip webhook; the adapter
 * translates between the agent endpoint format and ZeroClaw's NDJSON stream.
 */
interface ZeroClawAdapter {
  readonly agentId: string;
  readonly webhookUrl: string;
}

/** Raw ZeroClaw config from schema (all fields optional strings/bools) */
type RawZeroClawConfig = NonNullable<AIBotConfig["zeroclow"]>;

/**
 * Safely extract a ZeroClawAdapter from the optional schema config.
 * Returns None if zeroclow is not configured or enabled is false.
 */
const createZeroClawAdapter = (
  raw: O.Option<RawZeroClawConfig>,
): O.Option<ZeroClawAdapter> =>
  pipe(
    raw,
    O.chain((zc) =>
      zc.enabled && zc.webhookUrl
        ? O.some({
            agentId: zc.agentId ?? "lies_exposed",
            webhookUrl: zc.webhookUrl,
          })
        : O.none,
    ),
  );

export const loadContext = (
  getToken: () => string | null,
): TaskEither<AIBotError, ClientContext> =>
  pipe(
    fp.TE.Do,
    fp.TE.bind("env", () =>
      pipe(loadAndParseENV(parseENV)(process.cwd()), fp.TE.fromEither),
    ),
    fp.TE.chainFirst(({ env }) =>
      pipe(
        fp.TE.fromIOEither(initSentry(env.SENTRY_DSN)),
        fp.TE.mapLeft(toAIBotError),
      ),
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
    fp.TE.bind("zeroclow", ({ config }) =>
      fp.TE.right(
        createZeroClawAdapter(
          config.config.zeroclow
            ? O.some(config.config.zeroclow)
            : O.none,
        ),
      ),
    ),
    fp.TE.bind("agent", ({ config, env, zeroclow }) => {
      // WS7: when ZeroClaw is enabled, use its webhook URL instead of the
      // legacy agent URL. The ZeroClaw webhook accepts the same agent endpoint
      // payloads and returns NDJSON responses.
      const baseURL = pipe(
        zeroclow,
        O.map((zc) => zc.webhookUrl),
        O.getOrElse(() => config.config.agent.url.toString()),
      );

      const hasZeroClaw = pipe(
        zeroclow,
        O.fold(() => false, () => true),
      );

      return fp.TE.right(
        GetResourceClient(
          axios.default.create({
            baseURL,
            timeout:
              env.AGENT_REQUEST_TIMEOUT_MS ?? DEFAULT_AGENT_REQUEST_TIMEOUT_MS,
            headers: hasZeroClaw
              ? {}
              : {
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
      );
    }),
    fp.TE.bind("token", ({ env, logger }) =>
      pipe(
        env.API_TOKEN,
        O.fold(
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
        zeroclow,
      }) => {
        apiRestClient.interceptors.request.use((req) => {
          const token = getToken();
          if (token) {
            req.headers.set("Authorization", `Bearer ${getToken()}`);
          }
          return req;
        });

        const hasZeroClaw = pipe(
          zeroclow,
          O.fold(() => false, () => true),
        );

        logger.info.log("AI BOT config %O", {
          ...config.config,
          zeroclow: hasZeroClaw
            ? pipe(
                zeroclow,
                O.map((zc) => ({ enabled: true, agentId: zc.agentId })),
                O.getOrElse(() => ({ enabled: true, agentId: "lies_exposed" })),
              )
            : { enabled: false },
        });

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
