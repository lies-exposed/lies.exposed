import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import * as tests from "@liexp/test";
import { describe, test, expect, beforeAll } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Create User", () => {
  let Test: AppTest, authorizationToken: string, user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/users").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:create' permission", async () => {
    const response = await Test.req
      .post("/v1/users")
      .set("Authorization", authorizationToken)
      .send({
        username: tests.fc.sample(tests.fc.string({ minLength: 5 }))[0],
        email: tests.fc.sample(tests.fc.emailAddress())[0],
        password: "password123",
      });

    expect(response.status).toEqual(401);
  });
});
