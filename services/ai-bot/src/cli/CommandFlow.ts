import type { ClientContext } from '../context.js';


export type CommandFlow = (
  ctx: ClientContext,
  args: string[]
) => Promise<void> | void;
