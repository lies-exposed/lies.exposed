import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import fc from "fast-check";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { loginUser } from "../../../../../test/utils/user.utils.js";

describe("List Queues", () => {
  let Test: AppTest,
    authorizationToken: string,
    adminAuthorization: string,
    user;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    const adminUser = await saveUser(Test.ctx, ["admin:create", "admin:read"]);
    const { authorization: adminAuth } = await loginUser(Test)(adminUser);
    adminAuthorization = adminAuth;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.get("/v1/queues");

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:read' permission", async () => {
    const response = await Test.req
      .get("/v1/queues")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(401);
  });

  test("Should return 200 and include created job when authorized", async () => {
    const id = fc.sample(fc.uuid(), 1)[0];
    const text = fc.sample(fc.string({ minLength: 10, maxLength: 200 }), 1)[0];

    // Create a queue job as admin
    await Test.req
      .post("/v1/queues/openai-summarize/events")
      .set("Authorization", adminAuthorization)
      .send({ id, data: { text } })
      .expect(200);

    const listRes = await Test.req
      .get("/v1/queues")
      .set("Authorization", adminAuthorization)
      .expect(200);

    expect(listRes.body).toHaveProperty("data");
    expect(Array.isArray(listRes.body.data)).toBeTruthy();

    const found = listRes.body.data.find((q: any) => q.id === id);
    expect(found).toBeDefined();
  });

  test("Should properly decode queue objects with Date fields", async () => {
    const id = fc.sample(fc.uuid(), 1)[0];
    const text = fc.sample(fc.string({ minLength: 10, maxLength: 200 }), 1)[0];

    // Create a queue job
    await Test.req
      .post("/v1/queues/openai-summarize/events")
      .set("Authorization", adminAuthorization)
      .send({ id, data: { text } })
      .expect(200);

    // List queues and verify date fields are present and valid
    const listRes = await Test.req
      .get("/v1/queues")
      .set("Authorization", adminAuthorization)
      .expect(200);

    const queue = listRes.body.data.find((q: any) => q.id === id);
    expect(queue).toBeDefined();
    expect(queue.createdAt).toBeDefined();
    expect(queue.updatedAt).toBeDefined();

    // Verify dates are ISO strings or Date objects (not null/undefined)
    expect(
      typeof queue.createdAt === "string" || queue.createdAt instanceof Date,
    ).toBeTruthy();
    expect(
      typeof queue.updatedAt === "string" || queue.updatedAt instanceof Date,
    ).toBeTruthy();
  });

  test("Should support sorting by createdAt ascending", async () => {
    const id1 = fc.sample(fc.uuid(), 1)[0];
    const id2 = fc.sample(fc.uuid(), 1)[0];
    const text = fc.sample(fc.string({ minLength: 10, maxLength: 200 }), 1)[0];

    // Create two queue jobs
    await Test.req
      .post("/v1/queues/openai-summarize/events")
      .set("Authorization", adminAuthorization)
      .send({ id: id1, data: { text } })
      .expect(200);

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 100));

    await Test.req
      .post("/v1/queues/openai-summarize/events")
      .set("Authorization", adminAuthorization)
      .send({ id: id2, data: { text } })
      .expect(200);

    // List with ascending sort
    const listRes = await Test.req
      .get("/v1/queues?_sort=createdAt&_order=ASC")
      .set("Authorization", adminAuthorization)
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(Array.isArray(listRes.body.data)).toBeTruthy();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(2);

    // Find our queues in the response
    const queue1Index = listRes.body.data.findIndex((q: any) => q.id === id1);
    const queue2Index = listRes.body.data.findIndex((q: any) => q.id === id2);

    // queue1 should come before queue2 in ascending order
    expect(queue1Index).toBeGreaterThanOrEqual(0);
    expect(queue2Index).toBeGreaterThanOrEqual(0);
    expect(queue1Index).toBeLessThan(queue2Index);
  });

  test("Should support sorting by createdAt descending", async () => {
    const id1 = fc.sample(fc.uuid(), 1)[0];
    const id2 = fc.sample(fc.uuid(), 1)[0];
    const text = fc.sample(fc.string({ minLength: 10, maxLength: 200 }), 1)[0];

    // Create two queue jobs
    await Test.req
      .post("/v1/queues/openai-summarize/events")
      .set("Authorization", adminAuthorization)
      .send({ id: id1, data: { text } })
      .expect(200);

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 100));

    await Test.req
      .post("/v1/queues/openai-summarize/events")
      .set("Authorization", adminAuthorization)
      .send({ id: id2, data: { text } })
      .expect(200);

    // List with descending sort
    const listRes = await Test.req
      .get("/v1/queues?_sort=createdAt&_order=DESC")
      .set("Authorization", adminAuthorization)
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(Array.isArray(listRes.body.data)).toBeTruthy();
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(2);

    // Find our queues in the response
    const queue1Index = listRes.body.data.findIndex((q: any) => q.id === id1);
    const queue2Index = listRes.body.data.findIndex((q: any) => q.id === id2);

    // queue2 should come before queue1 in descending order
    expect(queue1Index).toBeGreaterThanOrEqual(0);
    expect(queue2Index).toBeGreaterThanOrEqual(0);
    expect(queue2Index).toBeLessThan(queue1Index);
  });

  test("Should support sorting by status", async () => {
    const id = fc.sample(fc.uuid(), 1)[0];
    const text = fc.sample(fc.string({ minLength: 10, maxLength: 200 }), 1)[0];

    // Create a queue job
    await Test.req
      .post("/v1/queues/openai-summarize/events")
      .set("Authorization", adminAuthorization)
      .send({ id, data: { text } })
      .expect(200);

    // List with status sort (should not throw an error)
    const listRes = await Test.req
      .get("/v1/queues?_sort=status&_order=DESC")
      .set("Authorization", adminAuthorization)
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(Array.isArray(listRes.body.data)).toBeTruthy();
  });

  test("Should support pagination with sorting", async () => {
    const text = fc.sample(fc.string({ minLength: 10, maxLength: 200 }), 1)[0];

    // Create multiple queue jobs
    for (let i = 0; i < 3; i++) {
      const id = fc.sample(fc.uuid(), 1)[0];
      await Test.req
        .post("/v1/queues/openai-summarize/events")
        .set("Authorization", adminAuthorization)
        .send({ id, data: { text } })
        .expect(200);
    }

    // List with pagination and sorting
    const listRes = await Test.req
      .get("/v1/queues?_sort=createdAt&_order=DESC&_start=0&_end=10")
      .set("Authorization", adminAuthorization)
      .expect(200);

    expect(listRes.body.data).toBeDefined();
    expect(Array.isArray(listRes.body.data)).toBeTruthy();
    expect(listRes.body.total).toBeDefined();
  });
});
