import { type ServerContext } from "@liexp/backend/lib/context/server.js";
import cors from "cors";
import { type Router } from "express";
import { type OpenAI } from "openai";
import { type ENV } from "#io/ENV.js";
import { type EventsConfig } from "#queries/config/index.js";

export interface RouteContext extends ServerContext {
  openai: OpenAI;
  env: ENV;
  config: {
    cors: cors.CorsOptions
    dirs: {
      cwd: string;
      temp: {
        root: string;
        nlp: string;
        media: string;
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
