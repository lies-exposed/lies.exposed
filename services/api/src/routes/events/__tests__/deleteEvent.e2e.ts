import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as tests from "@liexp/test";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Delete Event", () => {
  let Test: AppTest;
  let authorizationToken: string;
  let adminAuthorizationToken: string;

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create a regular user (no admin permissions)
    const user = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    // Create an admin user with delete permission
    const adminUser = await saveUser(Test.ctx, ["admin:delete"]);
    const { authorization: adminAuth } = await loginUser(Test)(adminUser);
    adminAuthorizationToken = adminAuth;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.delete("/v1/events/fake-id");

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'admin:delete' permission", async () => {
    const response = await Test.req
      .delete("/v1/events/fake-id")
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(401);
  });

  describe("Soft Delete", () => {
    let eventToSoftDelete: EventV2Entity;

    beforeAll(async () => {
      // Create an event for soft delete test
      const [event] = tests.fc.sample(UncategorizedArb, 1).map((e) => ({
        ...e,
        date: new Date(),
        keywords: [],
        media: [],
        links: [],
        socialPosts: [],
      }));

      [eventToSoftDelete] = await throwTE(
        Test.ctx.db.save(EventV2Entity, [event]),
      );
    });

    test("Should soft-delete an event that is not already deleted", async () => {
      const response = await Test.req
        .delete(`/v1/events/${eventToSoftDelete.id}`)
        .set("Authorization", adminAuthorizationToken);

      expect(response.status).toEqual(200);
      expect(response.body.data).toMatchObject({
        id: eventToSoftDelete.id,
        type: eventToSoftDelete.type,
      });

      // Verify the event is soft-deleted (has deletedAt set)
      const softDeletedEventOption = await throwTE(
        Test.ctx.db.findOne(EventV2Entity, {
          where: { id: eventToSoftDelete.id },
          withDeleted: true,
        }),
      );
      const softDeletedEvent = fp.O.toNullable(softDeletedEventOption);

      expect(softDeletedEvent).toBeTruthy();
      expect(softDeletedEvent?.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe("Hard Delete", () => {
    let eventToHardDelete: EventV2Entity;

    beforeAll(async () => {
      // Create and soft-delete an event for hard delete test
      const [event] = tests.fc.sample(UncategorizedArb, 1).map((e) => ({
        ...e,
        date: new Date(),
        keywords: [],
        media: [],
        links: [],
        socialPosts: [],
      }));

      [eventToHardDelete] = await throwTE(
        Test.ctx.db.save(EventV2Entity, [event]),
      );

      // Soft-delete the event first
      await throwTE(
        Test.ctx.db.softDelete(EventV2Entity, eventToHardDelete.id),
      );
    });

    test("Should hard-delete an event that is already soft-deleted", async () => {
      const response = await Test.req
        .delete(`/v1/events/${eventToHardDelete.id}`)
        .set("Authorization", adminAuthorizationToken);

      expect(response.status).toEqual(200);
      expect(response.body.data).toMatchObject({
        id: eventToHardDelete.id,
        type: eventToHardDelete.type,
      });

      // Verify the event is completely removed (not even with withDeleted)
      const hardDeletedEventOption = await throwTE(
        Test.ctx.db.findOne(EventV2Entity, {
          where: { id: eventToHardDelete.id },
          withDeleted: true,
        }),
      );
      const hardDeletedEvent = fp.O.toNullable(hardDeletedEventOption);

      expect(hardDeletedEvent).toBeNull();
    });
  });

  test("Should return 404 for non-existent event", async () => {
    const uuid = tests.fc.sample(tests.Arbs.UUID.UUIDArb, 1)[0];
    const response = await Test.req
      .delete(`/v1/events/${uuid}`)
      .set("Authorization", adminAuthorizationToken);

    expect(response.status).toEqual(404);
  });
});
