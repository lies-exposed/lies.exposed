import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type CommandFlow } from "./command.type.js";
import { upsertPinnedMessage } from "#flows/tg/upsertPinnedMessage.flow.js";

export const upsertTGPinnedMessage: CommandFlow = async (ctx) => {
  await pipe(
    upsertPinnedMessage(20)(ctx),
    fp.TE.chainFirst(() => ctx.db.close()),
    throwTE,
    // eslint-disable-next-line no-console
  ).then(console.log);
};
