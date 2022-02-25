import { fc } from "@liexp/core/tests";
import { uuid } from "@liexp/shared/utils/uuid";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
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
    await Test.ctx.db.close()();
  });

  test("Should return bad request", async () => {
    const response = await Test.req.post("/v1/users/login").send({
      username: username,
      password: "my-secure-password",
    });

    expect(response.status).toEqual(400);
  });

  test("Should return the access token", async () => {
    const response = await Test.req.post("/v1/users/login").send({
      username: username,
      password: "my-real-secure-password",
    });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("data.token");
  });
});
