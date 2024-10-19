import { type Task } from "fp-ts/lib/Task.js";
import { type ServerContext } from "#context/context.type.js";

export type CronFnOpts = Date | "manual" | "init";
export type CronJobTE = (
  opts: CronFnOpts,
) => (ctx: ServerContext) => Task<void>;
