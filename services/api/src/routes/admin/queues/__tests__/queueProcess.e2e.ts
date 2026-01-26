import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { DoneStatus } from "@liexp/io/lib/http/Queue/index.js";
import { HumanReadableStringArb } from "@liexp/test/lib/arbitrary/HumanReadableString.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import fc from "fast-check";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { loginUser } from "../../../../../test/utils/user.utils.js";

describe("Process Queue", () => {
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
      "admin:edit",
      "admin:read",
    ]);
    const { authorization: adminAuth } = await loginUser(Test)(adminUser);
    adminAuthorization = adminAuth;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.post("/v1/queues/fake-id/process");

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:edit' permission", async () => {
    const response = await Test.req
      .post("/v1/queues/fake-id/process")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(401);
  });

  test("Should process created job when authorized", async () => {
    const id = fc.sample(UUIDArb, 1)[0];
    const text = fc.sample(HumanReadableStringArb({ count: 10 }), 1)[0];

    // Create job as admin
    await Test.req
      .post("/v1/queues/openai-summarize/events")
      .set("Authorization", adminAuthorization)
      .send({ id, data: { text }, status: DoneStatus.literals[0] })
      .expect(200);

    // Ensure redis publish mock resolves to avoid pubsub errors
    Test.mocks.redis.publish.mockResolvedValueOnce(1);

    // Trigger processing for the job (correct route: type/resource/id/process)
    const procRes = await Test.req
      .post(`/v1/queues/openai-summarize/events/${id}/process`)
      .set("Authorization", adminAuthorization);

    expect(procRes.status).toEqual(200);
  });
});
