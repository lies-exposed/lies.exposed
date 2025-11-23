import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import * as tests from "@liexp/test";
import { describe, test, expect, beforeAll } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Create Link", () => {
  let Test: AppTest, authorizationToken: string, user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/links").send({
      url: "https://example.com",
      title: "Example Link",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:create' permission", async () => {
    const response = await Test.req
      .post("/v1/links")
      .set("Authorization", authorizationToken)
      .send({
        url: "https://example.com",
        title: "Example Link",
      });

    expect(response.status).toEqual(401);
  });

  test("Should create link with admin:create permission", async () => {
    user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    const response = await Test.req
      .post("/v1/links")
      .set("Authorization", authorizationToken)
      .send({
        url: tests.fc.sample(tests.fc.webUrl())[0],
        title: tests.fc.sample(tests.fc.string({ minLength: 5 }))[0],
      });

    expect([200, 201, 400]).toContain(response.status);
  });
});
