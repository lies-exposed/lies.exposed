import { type Router } from "express";
import { type AgentContext } from "#context/context.type.js";

/**
 * Route create helper type with context {@link AgentContext}
 */
export type Route = (router: Router, ctx: AgentContext) => void;
