/* eslint-disable @typescript-eslint/no-var-requires */
require("module-alias")(process.cwd());

// other imports
import { GroupEntity } from "@entities/Group.entity";
import { fp } from "@liexp/core/lib/fp";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { pipe } from "fp-ts/lib/function";
import { fetchGroups } from "../build/queries/groups/fetchGroups.query";
import { startContext, stopContext } from "./start-ctx";

const run = async (): Promise<void> => {
  const ctx = await startContext();
  await pipe(
    walkPaginatedRequest({ logger: ctx.logger })(
      (input) =>
        fetchGroups(ctx)({
          _order: fp.O.some("DESC"),
          _sort: fp.O.some("createdAt"),
          _start: fp.O.some(input.skip as any),
          _end: fp.O.some(input.amount as any),
        }),
      (r) => r[1],
      (r) => r[0],
      0,
      20
    ),
    fp.TE.map((groups) =>
      groups.map((g) => ({
        ...g,
        username: g.username ? g.username : getUsernameFromDisplayName(g.name),
      }))
    ),
    fp.TE.chain((groups) => ctx.db.save(GroupEntity, groups)),
    fp.TE.map((groups) =>
      groups.map((g) => ({ id: g.id, name: g.name, username: g.username }))
    ),
    throwTE
    // eslint-disable-next-line no-console
  );
  await stopContext(ctx);
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
