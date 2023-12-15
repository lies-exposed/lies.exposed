import { createStats } from "@flows/stats/createStats.flow";
import { fp } from "@liexp/core/lib/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { pipe } from "fp-ts/lib/function";
import { PathReporter } from "io-ts/lib/PathReporter";
import { startContext } from "./start-ctx";

const toError = (m: string) => `

  ${m}

  $type = events|keywords|groups|actors
  $id = relation DB id
  create-stats.ts $type $id
`;

const run = async () => {
  const [, , _type, id] = process.argv;

  if (!_type) {
    throw new Error(toError(`Missing parameter 'type' `));
  }

  const type: "keywords" | "groups" | "actors" = _type as any;
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

void run().catch(console.error);
