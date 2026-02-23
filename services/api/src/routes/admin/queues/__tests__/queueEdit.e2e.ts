import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { HumanReadableStringArb } from "@liexp/test/lib/arbitrary/HumanReadableString.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import fc from "fast-check";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { loginUser } from "../../../../../test/utils/user.utils.js";

describe("Edit Queue", () => {
  let Test: AppTest;
  let anonAuth: string;
  let adminAuth: string;

  beforeAll(async () => {
    Test = await GetAppTest();
    const user = await saveUser(Test.ctx, []);
    const { authorization: a } = await loginUser(Test)(user);
    anonAuth = a;

    const admin = await saveUser(Test.ctx, ["admin:edit", "admin:create"]);
    const { authorization: b } = await loginUser(Test)(admin);
    adminAuth = b;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req
      .put("/v1/queues/openai-summarize/events/fake-id")
      .send({ status: "completed" });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:edit' permission", async () => {
    const response = await Test.req
      .put("/v1/queues/openai-summarize/events/fake-id")
      .set("Authorization", anonAuth)
      .send({ status: "completed" });

    expect(response.status).toEqual(401);
  });

  test("Should edit existing queue when authorized", async () => {
    // Create a queue job first
    const id = fc.sample(UUIDArb, 1)[0];
    const text = fc.sample(HumanReadableStringArb(), 1)[0];

    const createBody = {
      id,
      data: { text },
    };

    const createRes = await Test.req
      .post("/v1/queues/openai-summarize/events")
      .set("Authorization", adminAuth)
      .send(createBody);

    expect(createRes.status).toEqual(200);
    expect(createRes.body.data.id).toEqual(id);

    // Now edit the job - spread the created queue to include required date fields
    const editBody = {
      ...createRes.body.data,
      status: "completed",
      result: "processed",
    };

    const editRes = await Test.req
      .put(`/v1/queues/openai-summarize/events/${id}`)
      .set("Authorization", adminAuth)
      .send(editBody);

    expect(editRes.status).toEqual(200);
    expect(editRes.body.data.id).toEqual(id);
    expect(editRes.body.data.status).toEqual("completed");
    expect(editRes.body.data.result).toEqual("processed");
  });
});
