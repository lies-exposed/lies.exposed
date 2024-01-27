import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import D from "debug";
import { startContext } from "./start-ctx";
import { extractRelationsFromURL } from "#flows/events/extractFromURL.flow.js";
import { toControllerError } from "#io/ControllerError.js";

const run = async (): Promise<void> => {
  const [, , url] = process.argv;

  const ctx = await startContext();

  D.enable(ctx.env.DEBUG);

  await pipe(
    ctx.puppeteer.getBrowserFirstPage("about:blank", {}),
    fp.TE.mapLeft(toControllerError),
    fp.TE.chain((page) =>
      pipe(
        extractRelationsFromURL(ctx)(page, url),
        fp.TE.map((r) => JSON.stringify(r, null, 2)),
        fp.TE.chain(() =>
          fp.TE.tryCatch(() => page.close(), toControllerError),
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

void run();