import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { loginUser } from "../../../../../test/utils/user.utils.js";

describe("Create Queue", () => {
  let Test: AppTest, authorizationToken: string, user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req
      .post("/v1/queues/test-queue/test-resource")
      .send({
        type: "test-queue",
        data: {},
      });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:create' permission", async () => {
    const response = await Test.req
      .post("/v1/queues/test-queue/test-resource")
      .set("Authorization", authorizationToken)
      .send({
        type: "test-queue",
        data: {},
      });

    expect(response.status).toEqual(401);
  });
});
