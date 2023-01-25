import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
} from "@liexp/shared/io/http/User";
import type * as TE from 'fp-ts/TaskEither';
import { UserEntity } from "@entities/User.entity";
import { type ControllerError } from '@io/ControllerError';
import { type RouteContext } from "@routes/route.types";

export const getOneAdminOrFail = (ctx: RouteContext): TE.TaskEither<ControllerError,UserEntity> =>
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
      .getOneOrFail()
  );
