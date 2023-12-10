import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
} from "@liexp/shared/lib/io/http/User.js";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { UserEntity } from "#entities/User.entity.js";
import { type ControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

export const getOneAdminOrFail = (
  ctx: RouteContext,
): TE.TaskEither<ControllerError, UserEntity> =>
  ctx.db.execQuery(() =>
    ctx.db.manager
      .createQueryBuilder(UserEntity, "u")
      .where(`u.permissions::jsonb ? :perm`, {
        perm: AdminDelete.value,
      })
      .orWhere(`u.permissions::jsonb ? :perm`, {
        perm: AdminEdit.value,
      })
      .orWhere("u.permissions::jsonb ? :perm", {
        perm: AdminCreate.value,
      })
      .getOneOrFail(),
  );
