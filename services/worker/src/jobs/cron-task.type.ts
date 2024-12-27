import { type Task } from "fp-ts/lib/Task.js";
import { type WorkerContext } from "#context/context.js";

export type CronFnOpts = Date | "manual" | "init";
export type CronJobTE = (
  opts: CronFnOpts,
) => (ctx: WorkerContext) => Task<void>;
