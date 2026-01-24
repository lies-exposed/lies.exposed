import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { UserStatusApproved } from "@liexp/io/lib/http/User.js";
import { type AuthPermission } from "@liexp/io/lib/http/auth/permissions/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import fc from "fast-check";
import { type DatabaseContext } from "../../context/db.context.js";
import { UserEntity } from "../../entities/User.entity.js";
import { hash } from "../../utils/password.utils.js";

export interface UserTest {
  id: string;
  username: string;
  password: string;
}

export const saveUser = async (
  ctx: DatabaseContext,
  permissions: AuthPermission[],
): Promise<UserTest> => {
  const id = uuid();
  const username = `${id}@lies.exp`;
  const password = "password";
  const passwordHash = await throwTE(hash(password));

  await throwTE(
    ctx.db.save(UserEntity, [
      {
        id,
        username,
        passwordHash,
        email: username,
        permissions,
        status: UserStatusApproved.literals[0],
        firstName: fc.sample(fc.string())[0],
        lastName: fc.sample(fc.string())[0],
      },
    ]),
  );
  return {
    id,
    username,
    password,
  };
};
