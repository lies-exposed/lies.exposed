import { fp } from "@liexp/core/lib/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils";
import { pipe } from "fp-ts/lib/function";
import { fetchGroups } from "queries/groups/fetchGroups.query";
import { startContext } from "./start-ctx";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor";
import { GroupEntity } from "@entities/Group.entity";

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
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
