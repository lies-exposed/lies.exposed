import { type ServerContext } from "@liexp/backend/lib/context/server.js";
import { type OpenAI } from "@liexp/shared/lib/providers/openai/openai.provider.js";
import { type Router } from "express";
import { type AppConfig } from "#app/config.js";
import { type ENV } from "#io/ENV.js";
import { type LangchainProviderReader } from "#providers/ai/langchain.provider.js";
import { type QueuesProvider } from "#providers/queue.provider.js";

export interface RouteContext extends ServerContext {
  openai: OpenAI;
  langchain: LangchainProviderReader;
  queue: QueuesProvider;
  env: ENV;
  config: AppConfig;
}

/**
 * Route create helper type with context {@link RouteContext}
 */
export type Route = (r: Router, ctx: RouteContext) => void;
