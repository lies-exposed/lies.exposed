import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as tests from "@liexp/test";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Get Event", () => {
  let Test: AppTest;
  let testEvent: EventV2Entity;
  let deletedEvent: EventV2Entity;
  let authorizationToken: string;
  let adminAuthorizationToken: string;

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create a regular user
    const user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    // Create an admin user
    const adminUser = await saveUser(Test.ctx, ["admin:read"]);
    const { authorization: adminAuth } = await loginUser(Test)(adminUser);
    adminAuthorizationToken = adminAuth;

    // Create a regular event
    const events = tests.fc.sample(UncategorizedArb, 2).map((e) => ({
      ...e,
      date: new Date(),
      keywords: [],
      media: [],
      links: [],
      socialPosts: [],
    }));

    const [event1, event2] = await throwTE(
      Test.ctx.db.save(EventV2Entity, events),
    );

    testEvent = event1;

    // Create and soft-delete an event
    deletedEvent = event2;
    await throwTE(Test.ctx.db.softDelete(EventV2Entity, deletedEvent.id));
  });

  test("Should return an event without authentication (public endpoint)", async () => {
    const response = await Test.req.get(`/v1/events/${testEvent.id}`);

    expect(response.status).toEqual(200);
    expect(response.body.data).toMatchObject({
      id: testEvent.id,
      type: testEvent.type,
    });
  });

  test("Should return an event for authenticated regular user", async () => {
    const response = await Test.req
      .get(`/v1/events/${testEvent.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data).toMatchObject({
      id: testEvent.id,
      type: testEvent.type,
    });
  });

  test("Should return 404 for deleted event when user is unauthenticated", async () => {
    const response = await Test.req.get(`/v1/events/${deletedEvent.id}`);

    expect(response.status).toEqual(404); // NotFoundError
  });

  test("Should return 404 for deleted event when non-admin user is authenticated", async () => {
    const response = await Test.req
      .get(`/v1/events/${deletedEvent.id}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(404); // NotFoundError
  });

  test("Should return deleted event for admin user", async () => {
    const response = await Test.req
      .get(`/v1/events/${deletedEvent.id}`)
      .set("Authorization", adminAuthorizationToken);

    expect(response.status).toEqual(200);
    expect(response.body.data).toMatchObject({
      id: deletedEvent.id,
      type: deletedEvent.type,
    });
  });

  test("Should return 404 for non-existent event", async () => {
    const uuid = tests.fc.sample(tests.Arbs.UUID.UUIDArb, 1)[0];
    const response = await Test.req
      .get(`/v1/events/${uuid}`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(404); // NotFoundError
  });
});
