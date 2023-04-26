import { upsertPinnedMessage } from "@flows/tg/upsertPinnedMessage.flow";
import { fp } from "@liexp/core/lib/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { pipe } from "fp-ts/lib/function";
import { makeContext } from "../src/server";
import { loadENV, parseENV } from "@utils/env.utils";

const run = () => {
  loadENV();
  return pipe(
    parseENV(process.env),
    fp.TE.fromEither,
    fp.TE.chain((env) => makeContext({ ...env, TG_BOT_POLLING: false })),
    fp.TE.chainFirst((ctx) => upsertPinnedMessage(ctx)(20)),
    fp.TE.chain((ctx) => ctx.db.close()),
    throwTE
  );
};

void run().then(console.log).catch(console.error);
