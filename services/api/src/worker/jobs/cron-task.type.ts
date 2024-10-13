import { type Task } from "fp-ts/lib/Task.js";
import { type RouteContext } from "#routes/route.types.js";

export type CronFnOpts = Date | "manual" | "init";
export type CronJobTE = (opts: CronFnOpts) => (ctx: RouteContext) => Task<void>;
