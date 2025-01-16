import { loadENV } from "@liexp/core/lib/env/utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { ENVParser } from "@liexp/shared/lib/utils/env.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
import { type WorkerContext } from "../context/context.js";
import { loadImplementation } from "../context/load.js";
import { makeContext } from "../context/make.js";
import { ENV } from "../io/env.js";

export const startContext = async (env?: any): Promise<WorkerContext> => {
  loadENV(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? ".env");
  if (process.env.NODE_ENV === "development") {
    loadENV(process.cwd(), ".env.local", true);
  }

  D.enable(process.env.DEBUG ?? "@liexp:*:error");

  process.env.TG_BOT_POLLING = "false";

  return pipe(
    ENVParser(ENV.decode)({ ...process.env, TG_BOT_POLLING: "false", ...env }),
    fp.TE.fromEither,
    fp.TE.chain((env) => makeContext(env, loadImplementation(env))),
    throwTE,
  );
};

export const stopContext = async (ctx: WorkerContext): Promise<void> => {
  await pipe(ctx.db.close(), throwTE);
  process.exit(0);
};
