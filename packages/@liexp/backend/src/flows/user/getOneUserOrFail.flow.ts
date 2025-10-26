import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
} from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { UserEntity } from "../../entities/User.entity.js";
import { type DBError } from "../../providers/orm/database.provider.js";

export const getOneAdminOrFail = <C extends DatabaseContext>(
  ctx: C,
): TaskEither<DBError, UserEntity> =>
  ctx.db.execQuery((em) =>
    em
      .createQueryBuilder(UserEntity, "u")
      .where(`u.permissions::jsonb ? :perm`, {
        perm: AdminDelete.literals[0],
      })
      .orWhere(`u.permissions::jsonb ? :perm`, {
        perm: AdminEdit.literals[0],
      })
      .orWhere("u.permissions::jsonb ? :perm", {
        perm: AdminCreate.literals[0],
      })
      .getOneOrFail(),
  );
