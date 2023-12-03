import { type ServerContext } from "@liexp/backend/lib/context/server";
import { type Router } from "express";
import { type ENV } from "@io/ENV";
import { type EventsConfig } from "@queries/config";

export interface RouteContext extends ServerContext {
  env: ENV;
  config: {
    dirs: {
      cwd: string;
      temp: {
        root: string;
        media: string;
      };
    };
    events: EventsConfig;
  };
}

/**
 * Route create helper type with context {@link RouteContext}
 */
export type Route = (r: Router, ctx: RouteContext) => void;
