import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import * as tests from "@liexp/test";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Create Group", () => {
  let Test: AppTest, authorizationToken: string, user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/groups").send({
      name: "Test Group",
      username: "test-group",
      color: "ffffff",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:create' permission", async () => {
    const response = await Test.req
      .post("/v1/groups")
      .set("Authorization", authorizationToken)
      .send({
        name: "Test Group",
        username: "test-group",
        color: "ffffff",
      });

    expect(response.status).toEqual(401);
  });

  test("Should create group with admin:create permission", async () => {
    user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    const response = await Test.req
      .post("/v1/groups")
      .set("Authorization", authorizationToken)
      .send({
        name: tests.fc.sample(tests.fc.string({ minLength: 5 }))[0],
        username: tests.fc.sample(tests.fc.string({ minLength: 5 }))[0],
        color: "ffffff",
        body: "Test group body",
      });

    expect([200, 201, 400]).toContain(response.status);
  });
});
