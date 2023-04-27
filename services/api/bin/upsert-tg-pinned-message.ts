import { loadENV } from "@liexp/core/lib/env/utils";
import { fp } from "@liexp/core/lib/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { pipe } from "fp-ts/lib/function";
import { makeContext } from "../src/server";
import { upsertPinnedMessage } from "@flows/tg/upsertPinnedMessage.flow";
import { parseENV } from "@utils/env.utils";

const run = async (): Promise<void> => {
  loadENV();
  await pipe(
    parseENV(process.env),
    fp.TE.fromEither,
    fp.TE.chain((env) => makeContext({ ...env, TG_BOT_POLLING: false })),
    fp.TE.chainFirst((ctx) => upsertPinnedMessage(ctx)(20)),
    fp.TE.chain((ctx) => ctx.db.close()),
    throwTE
  // eslint-disable-next-line no-console
  ).then(console.log);
};

// eslint-disable-next-line no-console
void run().catch(console.error);
