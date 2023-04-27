import { loadENV } from '@liexp/core/lib/env/utils';
import { fp } from '@liexp/core/lib/fp';
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import dotenv from "dotenv";
import { pipe } from 'fp-ts/lib/function';
import { PathReporter } from "io-ts/lib/PathReporter";
import { makeContext } from "../src/server";
import { createStatsByEntityType } from "@flows/stats/createStatsByEntityType.flow";
import { parseENV } from '@utils/env.utils';

const run = async (): Promise<void> => {
  const [, , type, id] = process.argv;

  dotenv.config();

  loadENV(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? "../../.env");

  const ctx = await pipe(
    parseENV({ ...process.env, TG_BOT_POLLING: "false" }),
    fp.TE.fromEither,
    fp.TE.chain(makeContext),
    throwTE
  );

  const result = await createStatsByEntityType(ctx)(type as any, id)();

  if (result._tag === "Left") {
    ctx.logger.error.log("Error %O", result.left);
    ctx.logger.error.log(
      "Details %O",
      PathReporter.report((result.left.details as any).errors)
    );
  } else {
    ctx.logger.info.log("Output: %O", result.right);
  }
};

// eslint-disable-next-line no-console
run().catch(console.error);
