import { type RouteContext } from "#routes/route.types.js";

export type CommandFlow = (
  ctx: RouteContext,
  args: string[],
) => Promise<void> | void;
