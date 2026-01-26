import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import fc from "fast-check";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { loginUser } from "../../../../../test/utils/user.utils.js";

describe("Delete Queue", () => {
  let Test: AppTest,
    authorizationToken: string,
    adminAuthorization: string,
    user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    const adminUser = await saveUser(Test.ctx, [
      "admin:create",
      "admin:delete",
      "admin:read",
    ]);
    const { authorization: adminAuth } = await loginUser(Test)(adminUser);
    adminAuthorization = adminAuth;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.delete(
      "/v1/queues/test-queue/test-resource/fake-id",
    );

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:delete' permission", async () => {
    const response = await Test.req
      .delete("/v1/queues/test-queue/test-resource/fake-id")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(401);
  });

  test("Should delete created job when authorized", async () => {
    const id = fc.sample(fc.uuid(), 1)[0];
    const text = fc.sample(fc.string({ minLength: 10, maxLength: 200 }), 1)[0];

    // Create job as admin
    await Test.req
      .post("/v1/queues/openai-summarize/events")
      .set("Authorization", adminAuthorization)
      .send({ id, data: { text } })
      .expect(200);

    // Delete the job
    await Test.req
      .delete(`/v1/queues/openai-summarize/events/${id}`)
      .set("Authorization", adminAuthorization)
      .expect(200);

    // Verify it's gone (API may return 404 or a server error for missing job)
    const getRes = await Test.req
      .get(`/v1/queues/openai-summarize/events/${id}`)
      .set("Authorization", adminAuthorization);

    expect([404, 500]).toContain(getRes.status);
  });
});
