import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { EffectDecoder } from "@liexp/shared/lib/endpoints/helpers.js";
import { ENVParser } from "@liexp/shared/lib/utils/env.utils.js";
import { GetResourceClient } from "@ts-endpoint/resource-client";
import axios from "axios";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type CLIContext } from "./command.type.js";
import { ENV } from "#io/ENV.js";

/**
 * Creates a lightweight CLI context with a typed API client.
 * Does not start MCP, LangChain, or Puppeteer.
 */
export const makeCLIContext = (): TE.TaskEither<Error, CLIContext> =>
  pipe(
    loadAndParseENV(ENVParser(Schema.decodeUnknownEither(ENV)))(process.cwd()),
    TE.fromEither,
    TE.map((env) => {
      const logger = GetLogger("agent-cli");

      const axiosClient = axios.create({
        baseURL: `${env.API_BASE_URL}/v1`,
        headers: { Authorization: `Bearer ${env.API_TOKEN}` },
      });

      const api = GetResourceClient(axiosClient, Endpoints, {
        decode: EffectDecoder((e) =>
          DecodeError.of("API client decode error", e),
        ),
      });

      return { env, api, logger };
    }),
  );
