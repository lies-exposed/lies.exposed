import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { HumanReadableStringArb } from "@liexp/test/lib/arbitrary/HumanReadableString.arbitrary.js";
import { URLArb } from "@liexp/test/lib/arbitrary/URL.arbitrary.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import { EventTypeArb } from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";
import fc from "fast-check";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { loginUser } from "../../../../../test/utils/user.utils.js";

describe("Create Queue", () => {
  let Test: AppTest;
  let anonAuth: string;
  let adminAuth: string;

  beforeAll(async () => {
    Test = await GetAppTest();
    const user = await saveUser(Test.ctx, []);
    const { authorization: a } = await loginUser(Test)(user);
    anonAuth = a;

    const admin = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization: b } = await loginUser(Test)(admin);
    adminAuth = b;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.post(
      "/v1/queues/openai-create-event-from-text/events",
    );

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:create' permission", async () => {
    const response = await Test.req
      .post("/v1/queues/openai-create-event-from-text/events")
      .set("Authorization", anonAuth)
      .send({ id: fc.sample(UUIDArb, 1)[0] });

    expect(response.status).toEqual(401);
  });

  test("Should create openai-create-event-from-url queue", async () => {
    const id = fc.sample(UUIDArb, 1)[0];
    const url = fc.sample(URLArb, 1)[0];
    const type = fc.sample(EventTypeArb, 1)[0];

    const body = {
      id,
      data: { url, type },
    };

    const res = await Test.req
      .post("/v1/queues/openai-create-event-from-url/events")
      .set("Authorization", adminAuth)
      .send(body);

    expect(res.status).toEqual(200);
    expect(res.body.data.id).toEqual(id);
    expect(res.body.data.type).toEqual("openai-create-event-from-url");
  });

  test("Should create openai-create-event-from-text queue", async () => {
    const id = fc.sample(UUIDArb, 1)[0];
    const text = fc.sample(HumanReadableStringArb(), 1)[0];
    const type = fc.sample(EventTypeArb, 1)[0];

    const body = {
      id,
      data: { text, type },
    };

    const res = await Test.req
      .post("/v1/queues/openai-create-event-from-text/events")
      .set("Authorization", adminAuth)
      .send(body);

    expect(res.status).toEqual(200);
    expect(res.body.data.id).toEqual(id);
    expect(res.body.data.type).toEqual("openai-create-event-from-text");
  });

  test("Should create openai-create-event-from-links queue", async () => {
    const id = fc.sample(UUIDArb, 1)[0];
    const linkIds = fc.sample(
      fc.array(UUIDArb, { minLength: 1, maxLength: 3 }),
      1,
    )[0];
    const type = fc.sample(EventTypeArb, 1)[0];

    const body = {
      id,
      data: { linkIds, type },
    };

    const res = await Test.req
      .post("/v1/queues/openai-create-event-from-links/events")
      .set("Authorization", adminAuth)
      .send(body);

    expect(res.status).toEqual(200);
    expect(res.body.data.id).toEqual(id);
    expect(res.body.data.type).toEqual("openai-create-event-from-links");
  });

  test("Should create openai-update-event queue", async () => {
    const id = fc.sample(UUIDArb, 1)[0];
    const eventId = fc.sample(UUIDArb, 1)[0];
    const type = fc.sample(EventTypeArb, 1)[0];

    const body = {
      id,
      data: { id: eventId, type },
    };

    const res = await Test.req
      .post("/v1/queues/openai-update-event/events")
      .set("Authorization", adminAuth)
      .send(body);

    expect(res.status).toEqual(200);
    expect(res.body.data.id).toEqual(id);
    expect(res.body.data.type).toEqual("openai-update-event");
  });

  test("Should create openai-embedding and openai-summarize queues", async () => {
    const id1 = fc.sample(UUIDArb, 1)[0];
    const url = fc.sample(URLArb, 1)[0];

    const embedBody = {
      id: id1,
      data: { url },
    };

    const res1 = await Test.req
      .post("/v1/queues/openai-embedding/events")
      .set("Authorization", adminAuth)
      .send(embedBody);

    expect(res1.status).toEqual(200);
    expect(res1.body.data.id).toEqual(id1);
    expect(res1.body.data.type).toEqual("openai-embedding");

    const id2 = fc.sample(UUIDArb, 1)[0];
    const text = fc.sample(HumanReadableStringArb(), 1)[0];

    const summarizeBody = {
      id: id2,
      data: { text },
    };

    const res2 = await Test.req
      .post("/v1/queues/openai-summarize/events")
      .set("Authorization", adminAuth)
      .send(summarizeBody);

    expect(res2.status).toEqual(200);
    expect(res2.body.data.id).toEqual(id2);
    expect(res2.body.data.type).toEqual("openai-summarize");
  });
});
