import { type ServerContext } from "@liexp/backend/lib/context/server.js";
import { type Router } from "express";
import { type ENV } from "#io/ENV.js";
import { type EventsConfig } from "#queries/config/index.js";

export interface RouteContext extends ServerContext {
  env: ENV;
  config: {
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
