import { pipe } from "@liexp/core/lib/fp/index.js";
import D from "debug";
// eslint-disable-next-line import/no-named-as-default
import { startContext, stopContext } from "./start-ctx.js";

/**
 * Usage create-from-wikipedia $type $search
 *
 * $type        type of entity to create  (actor|area|group)
 * $search      text used as query for wikipedia search api
 *
 * @returns void
 */
const run = async (): Promise<any> => {

  const ctx = await startContext();

  D.enable(ctx.env.DEBUG);

  const files = await pipe(ctx.privateGPT.listIngested());

  ctx.logger.debug.log("Search results %O", files);

  await stopContext(ctx);
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
