import { createStats } from "@flows/stats/createStats.flow";
import { fp } from "@liexp/core/lib/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import dotenv from "dotenv";
import { pipe } from "fp-ts/lib/function";
import { PathReporter } from "io-ts/lib/PathReporter";
import path from "path";
import { makeContext } from "../src/server";

const toError = (m: string) => `

  ${m}

  $type = events|keywords|groups|actors
  $id = relation DB id
  ts-node ./create-stats.ts $type $id
`;

const run = () => {
  const [, , _type, id] = process.argv;

  if (!_type) {
    throw new Error(toError(`Missing parameter 'type' `));
  }

  const type: "keywords" | "groups" | "actors" = _type as any;
  console.log("Creating stats for type ", type);

  if (!id) {
    throw new Error(toError(`Missing parameter 'id' `));
  }

  process.env.DEBUG = "*";

  dotenv.config({
    path: path.resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? ".env"),
  });

  return pipe(
    makeContext({ ...process.env, TG_BOT_POLLING: "false" }),
    fp.TE.chain((ctx) =>
      pipe(
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
        )
      )
    ),
    throwTE
  );
};

run().catch(console.error);
