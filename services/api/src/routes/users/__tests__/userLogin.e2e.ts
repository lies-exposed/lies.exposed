import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { hash } from "@liexp/backend/lib/utils/password.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import fc from "fast-check";
import * as TE from "fp-ts/lib/TaskEither.js";
import { describe, test, expect, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

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
    // Ensure user is in "Approved" status for this test
    // (Transaction isolation means changes from previous tests are rolled back)
    await throwTE(
      Test.ctx.db.save(UserEntity, [{ ...user, status: "Approved" }]),
    );

    const response = await Test.req.post("/v1/users/login").send({
      username,
      password: "my-real-secure-password",
    });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("data.token");
  });

  test("Should reject login with a wrong telegram token", async () => {
    await throwTE(
      Test.ctx.db.save(UserEntity, [
        { ...user, status: "Approved", telegramToken: "right-token" },
      ]),
    );

    const response = await Test.req.post("/v1/users/login").send({
      username,
      token: "wrong-token",
    });

    expect(response.status).toEqual(400);
    expect(response.body).not.toHaveProperty("data.token");
  });

  test("Should accept login with the right telegram token", async () => {
    await throwTE(
      Test.ctx.db.save(UserEntity, [
        { ...user, status: "Approved", telegramToken: "right-token" },
      ]),
    );

    const response = await Test.req.post("/v1/users/login").send({
      username,
      token: "right-token",
    });

    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("data.token");
  });

  test("Should rate limit repeated login attempts for the same username", async () => {
    const attempts = [];
    for (let i = 0; i < 12; i++) {
      attempts.push(
        await Test.req.post("/v1/users/login").send({
          username: `rl-${username}`,
          password: "nope",
        }),
      );
    }
    expect(attempts.some((r) => r.status === 429)).toBe(true);
  });
});
