import { ServerContext } from "@liexp/shared/context/server";
import { Router } from "express";
import { ENV } from "@io/ENV";

export interface RouteContext extends ServerContext {
  env: ENV;
}

export type Route = (r: Router, ctx: RouteContext) => void;
