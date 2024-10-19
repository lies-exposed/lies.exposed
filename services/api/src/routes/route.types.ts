import { type OpenAI } from "@liexp/shared/lib/providers/openai/openai.provider.js";
import { type Router } from "express";
import { type ServerContext } from "../context/context.type.js";
import { type LangchainProviderReader } from "#providers/ai/langchain.provider.js";

export interface RouteContext extends ServerContext {
  openai: OpenAI;
  langchain: LangchainProviderReader;
}

/**
 * Route create helper type with context {@link RouteContext}
 */
export type Route = (r: Router, ctx: RouteContext) => void;
// export type Route2 = (r: Router) => (ctx: RouteContext) => void;
