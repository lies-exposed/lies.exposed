import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type CommandFlow } from "./command.type.js";
import { extractRelationsFromURL as extractRelationsFromURLFlow } from "#flows/nlp/extractRelationsFromURL.flow.js";
import { toControllerError } from "#io/ControllerError.js";

export const extractEntitiesFromURL: CommandFlow = async (
  ctx,
  args,
): Promise<void> => {
  const [url] = args;

  await pipe(
    ctx.puppeteer.getBrowserFirstPage("about:blank", {}),
    fp.TE.mapLeft(toControllerError),
    fp.TE.chain((page) =>
      pipe(
        extractRelationsFromURLFlow(page, url)(ctx),
        fp.TE.map((r) => JSON.stringify(r, null, 2)),
        fp.TE.chainFirst(() =>
          fp.TE.tryCatch(() => page.browser().close(), toControllerError),
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
