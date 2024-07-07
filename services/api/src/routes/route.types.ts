import { type ServerContext } from "@liexp/backend/lib/context/server.js";
import { type OpenAI } from "@liexp/shared/lib/providers/openai/openai.provider.js";
import type cors from "cors";
import { type Router } from "express";
import { type ENV } from "#io/ENV.js";
import { type LangchainProviderReader } from "#providers/ai/langchain.provider.js";
import { type QueuesProvider } from "#providers/queue.provider.js";
import { type EventsConfig } from "#queries/config/index.js";

export interface RouteContext extends ServerContext {
  openai: OpenAI;
  langchain: LangchainProviderReader;
  queue: QueuesProvider;
  env: ENV;
  config: {
    cors: cors.CorsOptions;
    dirs: {
      cwd: string;
      temp: {
        root: string;
        nlp: string;
        media: string;
        queue: string;
        stats: string;
      };
    };
    events: EventsConfig;
  };
}

/**
 * Route create helper type with context {@link RouteContext}
 */
export type Route = (r: Router, ctx: RouteContext) => void;
