import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { PathReporter } from "io-ts/lib/PathReporter.js";
import { type CommandFlow } from "./command.type.js";
import { createStats as createStatsFlow } from "#flows/stats/createStats.flow.js";

const toError = (m: string): string => `

  ${m}

  $type = events|keywords|groups|actors
  $id = relation DB id
  create-stats.ts $type $id
`;

export const createStats: CommandFlow = async (ctx, args): Promise<void> => {
  const [_type, id] = args;

  if (!_type) {
    throw new Error(toError(`Missing parameter 'type' `));
  }

  const type: "keywords" | "groups" | "actors" = _type as any;

  ctx.logger.info.log("Creating stats for type ", type);

  if (!id) {
    throw new Error(toError(`Missing parameter 'id' `));
  }

  return pipe(
    createStatsFlow(type, id)(ctx),
    fp.TE.bimap(
      (err) => {
        ctx.logger.error.log("Error %O", err);
        ctx.logger.error.log(
          "Details %O",
          PathReporter.report((err.details as any).errors),
        );
        return err;
      },
      (r) => {
        ctx.logger.info.log("Output: %O", r);
        return r;
      },
    ),
    throwTE,
  );
};
