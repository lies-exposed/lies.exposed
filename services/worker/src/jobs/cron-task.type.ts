import { type Task } from "fp-ts/lib/Task.js";
import { type WorkerContext } from "#context/context.js";

export type CronJobTE = () => (ctx: WorkerContext) => Task<void>;
