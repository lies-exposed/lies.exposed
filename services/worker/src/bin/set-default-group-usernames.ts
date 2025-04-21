import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { fetchGroups } from "@liexp/backend/lib/queries/groups/fetchGroups.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as O from "effect/Option";
import { type WorkerError } from "../io/worker.error.js";
import { type CommandFlow } from "./command.type.js";

export const setDefaultGroupUsernames: CommandFlow = async (ctx) => {
  const requestWalker = walkPaginatedRequest<
    [GroupEntity[], number],
    WorkerError,
    GroupEntity
  >(
    (input) =>
      fetchGroups({
        _order: O.some("DESC"),
        _sort: O.some("createdAt"),
        _start: O.some(input.skip),
        _end: O.some(input.amount),
      })(ctx),
    (r) => r[1],
    (r) => fp.TE.right(r[0]),
    0,
    20,
  );
  await pipe(
    requestWalker(ctx),
    fp.TE.map((groups) =>
      groups.map((g) => ({
        ...g,
        username: g.username ?? getUsernameFromDisplayName(g.name),
      })),
    ),
    fp.TE.chain((groups) => ctx.db.save(GroupEntity, groups)),
    fp.TE.map((groups) =>
      groups.map((g) => ({ id: g.id, name: g.name, username: g.username })),
    ),
    throwTE,
  );
};
