import { UserEntity } from "#entities/User.entity.js";
import { UserPermission } from "@liexp/shared/lib/io/http/User";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import { hash } from "#utils/password.utils.js";
import { fc } from "@liexp/test";
import { AppTest } from "./AppTest";

export const loginUser =
  (T: AppTest) =>
  async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ token: string; authorization: string }> => {
    const response = await T.req
      .post("/v1/users/login")
      .send({ username, password })
      .expect(201);

    const token = response.body.data.token;

    return { token, authorization: `Bearer ${token}` };
  };

export interface UserTest { id: string; username: string; password: string }

export const saveUser = async (
  Test: AppTest,
  permissions: UserPermission[]
): Promise<UserTest> => {
  const id = uuid();
  const username = `${id}@lies.exp`;
  const password = "password";
  const passwordHash = await throwTE(hash(password));

  await throwTE(
    Test.ctx.db.save(UserEntity, [
      {
        id,
        username,
        passwordHash,
        email: username,
        permissions,
        status: 'Approved',
        firstName: fc.sample(fc.string())[0],
        lastName: fc.sample(fc.string())[0],
      },
    ])
  );
  return {
    id,
    username,
    password,
  };
};
