import { type Router } from "express";
import { type ServerContext } from "#context/context.type.js";

/**
 * Route create helper type with context {@link ServerContext}
 */
export type Route = (router: Router, ctx: ServerContext) => void;
// export type Route2 = (r: Router) => (ctx: ServerContext) => void;
