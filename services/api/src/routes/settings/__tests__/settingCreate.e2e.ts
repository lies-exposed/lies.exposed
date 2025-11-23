import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import * as tests from "@liexp/test";
import { describe, test, expect, beforeAll } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Create Setting", () => {
  let Test: AppTest, authorizationToken: string, user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/settings").send({
      key: "test-setting",
      value: "test value",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:create' permission", async () => {
    const response = await Test.req
      .post("/v1/settings")
      .set("Authorization", authorizationToken)
      .send({
        key: tests.fc.sample(tests.fc.string({ minLength: 5 }))[0],
        value: tests.fc.sample(tests.fc.string())[0],
      });

    expect(response.status).toEqual(401);
  });
});
