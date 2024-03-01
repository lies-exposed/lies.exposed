import { loadENV } from "@liexp/core/lib/env/utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
import { makeContext } from "#context/index.js";
import { type RouteContext } from "#routes/route.types.js";
import { parseENV } from "#utils/env.utils.js";

export const startContext = async (env?: any): Promise<RouteContext> => {
  loadENV(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? ".env");
  if (process.env.NODE_ENV === "development") {
    loadENV(process.cwd(), ".env.local", true);
  }

  D.enable(process.env.DEBUG ?? "@liexp:*:error");

  return pipe(
    parseENV({ ...process.env, TG_BOT_POLLING: "false", ...env }),
    fp.TE.fromEither,
    fp.TE.chain(makeContext),
    throwTE
  );
};

export const stopContext = async (ctx: RouteContext): Promise<void> => {
  await pipe(ctx.db.close(), throwTE);
  process.exit(0);
};
