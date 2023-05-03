import { type ServerContext } from "@liexp/shared/lib/context/server";
import { type Router } from "express";
import { type ENV } from "@io/ENV";

export interface RouteContext extends ServerContext {
  env: ENV;
}

/**
 * Route create helper type with context {@link RouteContext}
 */
export type Route = (r: Router, ctx: RouteContext) => void;
