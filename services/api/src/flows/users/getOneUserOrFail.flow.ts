import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
} from "@liexp/shared/lib/io/http/User.js";
import { UserEntity } from "#entities/User.entity.js";
import { type TEReader } from "#flows/flow.types.js";

export const getOneAdminOrFail: TEReader<UserEntity> = (ctx) =>
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
