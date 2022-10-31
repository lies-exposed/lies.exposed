import { throwTE } from "@liexp/shared/utils/task.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import { fc } from "@liexp/test";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { UserEntity } from "@entities/User.entity";
import { hash } from "@utils/password.utils";

describe("User login", () => {
  let Test: AppTest;
  const userId = uuid();
  const username = `${userId}@lies.exposed`;
  beforeAll(async () => {
    Test = await initAppTest();
    await pipe(
      hash("my-real-secure-password"),
      TE.chain((password) =>
        Test.ctx.db.save(UserEntity, [
          {
            id: userId,
            username,
            passwordHash: password,
            email: username,
            firstName: fc.sample(fc.string())[0],
            lastName: fc.sample(fc.string())[0],
          },
        ])
      )
    )();
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.close());
  });

  test("Should return bad request", async () => {
    const response = await Test.req.post("/v1/users/login").send({
      username,
      password: "my-secure-password",
    });

    expect(response.status).toEqual(400);
  });

  test("Should return the access token", async () => {
    const response = await Test.req.post("/v1/users/login").send({
      username,
      password: "my-real-secure-password",
    });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("data.token");
  });
});
