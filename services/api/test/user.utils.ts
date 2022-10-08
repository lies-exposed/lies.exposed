import { UserEntity } from "@entities/User.entity";
import { UserPermission } from "@liexp/shared/io/http/User";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import { hash } from "@utils/password.utils";
import fc from "fast-check";
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

export const saveUser = async (
  Test: AppTest,
  permissions: UserPermission[]
): Promise<{ id: string; username: string; password: string }> => {
  const id = uuid();
  const username = `${id}@lies.exp`;
  const password = "password";
  const passwordHash = await throwTE(hash(password));

  await throwTE(
    Test.ctx.db.save(UserEntity, [
      {
        id: id,
        username: username,
        passwordHash: passwordHash,
        email: username,
        permissions,
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
