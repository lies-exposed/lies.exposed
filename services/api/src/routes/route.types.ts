import { type Router } from "express";
import { type ServerContext } from "../context/context.type.js";

export type RouteContext = ServerContext;

/**
 * Route create helper type with context {@link RouteContext}
 */
export type Route = (router: Router, ctx: RouteContext) => void;
// export type Route2 = (r: Router) => (ctx: RouteContext) => void;
