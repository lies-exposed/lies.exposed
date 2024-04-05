import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { startContext, stopContext } from "./start-ctx.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { ControllerError } from "#io/ControllerError.js";
import { fetchGroups } from "#queries/groups/fetchGroups.query.js";

const run = async (): Promise<void> => {
  const ctx = await startContext();
  const requestWalker = walkPaginatedRequest(ctx);
  await pipe(
    requestWalker<[GroupEntity[], number], ControllerError, GroupEntity>(
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
      20,
    ),
    fp.TE.map((groups) =>
      groups.map((g) => ({
        ...g,
        username: g.username ? g.username : getUsernameFromDisplayName(g.name),
      })),
    ),
    fp.TE.chain((groups) => ctx.db.save(GroupEntity, groups)),
    fp.TE.map((groups) =>
      groups.map((g) => ({ id: g.id, name: g.name, username: g.username })),
    ),
    throwTE,
    // eslint-disable-next-line no-console
  );
  await stopContext(ctx);
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
