import { type WorkerContext } from "../context/context.js";

export type CommandFlow = (
  ctx: WorkerContext,
  args: string[],
) => Promise<void> | void;
