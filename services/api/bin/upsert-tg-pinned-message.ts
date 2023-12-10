import { fp } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { pipe } from "fp-ts/lib/function";
import { startContext, stopContext } from "./start-ctx";
import { upsertPinnedMessage } from "#flows/tg/upsertPinnedMessage.flow";

const run = async (): Promise<void> => {
  const ctx = await startContext();
  await pipe(
    upsertPinnedMessage(ctx)(20),
    fp.TE.chainFirst(() => ctx.db.close()),
    throwTE
    // eslint-disable-next-line no-console
  ).then(console.log);

  await stopContext(ctx);
};

// eslint-disable-next-line no-console
void run().catch(console.error);
