import { type ServerContext } from "@liexp/shared/context/server";
import { type Router } from "express";
import { type ENV } from "@io/ENV";


export interface RouteContext extends ServerContext {
  env: ENV;
}

export type Route = (r: Router, ctx: RouteContext) => void;
