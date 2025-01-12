import { extractRelationsFromURL } from "@liexp/backend/lib/flows/admin/nlp/extractRelationsFromURL.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { toWorkerError } from "../io/worker.error.js";
import { type CommandFlow } from "./command.type.js";

export const extractEntitiesFromURL: CommandFlow = async (
  ctx,
  args,
): Promise<void> => {
  const [url] = args;

  await pipe(
    ctx.puppeteer.getBrowserFirstPage("about:blank", {}),
    fp.TE.mapLeft(toWorkerError),
    fp.TE.chain((page) =>
      pipe(
        extractRelationsFromURL(page, url)(ctx),
        fp.TE.map((r) => JSON.stringify(r, null, 2)),
        fp.TE.chainFirst(() =>
          fp.TE.tryCatch(() => page.browser().close(), toWorkerError),
        ),
      ),
    ),
    throwTE,
  )
    // eslint-disable-next-line no-console
    .then(console.log)
    // eslint-disable-next-line no-console
    .catch(console.error)
    .finally(() => process.exit(0));
};
