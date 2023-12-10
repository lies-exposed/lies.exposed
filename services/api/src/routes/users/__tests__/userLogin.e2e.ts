import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import { fc } from "@liexp/test";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { UserEntity } from "#entities/User.entity.js";
import { hash } from "#utils/password.utils.js";

describe("User login", () => {
  let Test: AppTest, user: UserEntity;
  const userId = uuid();
  const username = `${userId}@lies.exposed`;
  beforeAll(async () => {
    Test = await GetAppTest();
    user = await pipe(
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
        ]),
      ),
      TE.map(([user]) => user),
      throwTE,
    );
  });

  afterAll(async () => {
    await Test.utils.e2eAfterAll();
  });

  test("Should give an error for user not yet 'Approved'", async () => {
    const response = await Test.req.post("/v1/users/login").send({
      username,
      password: "my-real-secure-password",
    });

    expect(response.status).toEqual(500);
  });

  test("Should return bad request", async () => {
    await throwTE(
      Test.ctx.db.save(UserEntity, [{ ...user, status: "Approved" }]),
    );

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
