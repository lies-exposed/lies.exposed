import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type CommandFlow } from "./command.type.js";
import { createEntityStats } from "#flows/stats/createStats.flow.js";

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

  const validTypes = ["keywords", "groups", "actors"] as const;
  type ValidType = (typeof validTypes)[number];

  const isValidType = (value: string): value is ValidType => {
    return validTypes.includes(value as ValidType);
  };

  if (!isValidType(_type)) {
    throw new Error(
      toError(
        `Invalid type '${_type}'. Must be one of: ${validTypes.join(", ")}`,
      ),
    );
  }

  const type = _type;

  ctx.logger.info.log("Creating stats for type ", type);

  if (!id) {
    throw new Error(toError(`Missing parameter 'id' `));
  }

  return pipe(
    createEntityStats(type, id)(ctx),
    fp.TE.bimap(
      (err) => {
        ctx.logger.error.log("Error %O", err);

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
