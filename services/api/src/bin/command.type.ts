import { type ServerContext } from "#context/context.type.js";

export type CommandFlow = (
  ctx: ServerContext,
  args: string[],
) => Promise<void> | void;
