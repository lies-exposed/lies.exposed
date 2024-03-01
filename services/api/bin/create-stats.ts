import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { PathReporter } from "io-ts/lib/PathReporter.js";
import { startContext } from "./start-ctx.js";
import { createStats } from "#flows/stats/createStats.flow.js";

const toError = (m: string):string => `

  ${m}

  $type = events|keywords|groups|actors
  $id = relation DB id
  create-stats.ts $type $id
`;

const run = async (): Promise<void> => {
  const [, , _type, id] = process.argv;

  if (!_type) {
    throw new Error(toError(`Missing parameter 'type' `));
  }

  const type: "keywords" | "groups" | "actors" = _type as any;
  // eslint-disable-next-line no-console
  console.log("Creating stats for type ", type);

  if (!id) {
    throw new Error(toError(`Missing parameter 'id' `));
  }

  const ctx = await startContext();

  return pipe(
    createStats(ctx)(type, id),
    fp.TE.bimap(
      (err) => {
        ctx.logger.error.log("Error %O", err);
        ctx.logger.error.log(
          "Details %O",
          PathReporter.report((err.details as any).errors)
        );
        return err;
      },
      (r) => {
        ctx.logger.info.log("Output: %O", r);
        return r;
      }
    ),
    throwTE
  );
};

// eslint-disable-next-line no-console
void run().catch(console.error);
