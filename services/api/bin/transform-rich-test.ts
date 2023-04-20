import { loadENV } from "@liexp/core/lib/env/utils";
import { fp } from "@liexp/core/lib/fp";
import { deserializeToHTML } from "@liexp/shared/lib/slate/utils";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import D from "debug";
import { pipe } from "fp-ts/function";
import { makeContext } from "../src/server";
import { searchEventV2Query } from "@routes/events/queries/searchEventsV2.query";
import { parseENV } from "@utils/env.utils";

const run = async (): Promise<void> => {
  loadENV(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? "../../.env");

  D.enable(process.env.DEBUG ?? "@liexp:*");
  const ctx = await pipe(
    parseENV({ ...process.env, TG_BOT_POLLING: "false" }),
    fp.TE.fromEither,
    fp.TE.chain(makeContext),
    throwTE
  );

  const result = await pipe(
    searchEventV2Query(ctx)({}),
    fp.TE.map((r) => ({
      ...r,
      results: r.results.filter((e) => e.excerpt !== null),
    })),
    throwTE
  );

  result.results.forEach((e) => {
    ctx.logger.debug.log("Event %O", deserializeToHTML(e.excerpt as any));
  });

  // ctx.logger.info.log("Output: %O", result);
};

// eslint-disable-next-line no-console
run().catch(console.error);
