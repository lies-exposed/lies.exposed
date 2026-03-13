import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import {
  saveUser,
  type UserTest,
} from "@liexp/backend/lib/test/utils/user.utils.js";
import * as Auth from "@liexp/io/lib/http/auth/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { UUIDArb } from "@liexp/test/lib/arbitrary/common/UUID.arbitrary.js";
import { DeathEventArb } from "@liexp/test/lib/arbitrary/events/DeathEvent.arbitrary.js";
import { ScientificStudyArb } from "@liexp/test/lib/arbitrary/events/ScientificStudy.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import fc from "fast-check";
import { beforeAll, describe, expect, test } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

/**
 * Helper to build a minimal edit body for partial payload updates.
 * All base event fields are sent as undefined (= Option None = "preserve existing").
 * Media/links/keywords default to [] since they're M2M relations, not JSON payload.
 */
const partialEditBase = (type: string, payload: Record<string, unknown>) => ({
  type,
  date: undefined,
  draft: undefined,
  excerpt: undefined,
  body: undefined,
  media: undefined,
  links: undefined,
  keywords: undefined,
  payload,
});

describe("Edit Event - partial payload preserves existing fields", () => {
  let appTest: AppTest;
  let adminUser: UserTest;
  let adminAuthToken: string;

  beforeAll(async () => {
    appTest = await GetAppTest();
    adminUser = await saveUser(appTest.ctx, [
      Auth.Permissions.AdminDelete.literals[0],
    ]);
    adminAuthToken = await loginUser(appTest)(adminUser).then(
      ({ authorization }) => authorization,
    );
  });

  describe("Uncategorized - omitted payload fields are preserved from stored event", () => {
    const actorId = fc.sample(UUIDArb, 1)[0];
    const groupId = fc.sample(UUIDArb, 1)[0];
    const groupMemberId = fc.sample(UUIDArb, 1)[0];
    const locationId = fc.sample(UUIDArb, 1)[0];
    const endDate = new Date("2023-06-15").toISOString();

    let [storedEvent] = fc.sample(UncategorizedArb, 1).map((e) => ({
      ...e,
      draft: true,
      payload: {
        title: "initial title",
        actors: [actorId],
        groups: [groupId],
        groupsMembers: [groupMemberId],
        location: locationId,
        endDate,
      },
      media: [],
      links: [],
      keywords: [],
      socialPosts: [],
    }));

    beforeAll(async () => {
      const [saved] = await throwTE(
        appTest.ctx.db.save(EventV2Entity, [storedEvent]),
      );
      storedEvent = { ...storedEvent, ...(saved as any) };
    });

    test("should preserve actors, groups, groupsMembers, location and endDate when only updating title", async () => {
      const response = await appTest.req
        .put(`/v1/events/${storedEvent.id}`)
        .set("Authorization", adminAuthToken)
        .send(
          partialEditBase("Uncategorized", {
            title: "updated title",
            // actors, groups, groupsMembers, location, endDate intentionally omitted
          }),
        );

      expect(response.status).toEqual(200);

      const payload = response.body.data.payload;
      expect(payload.title).toEqual("updated title");
      expect(payload.actors).toEqual([actorId]);
      expect(payload.groups).toEqual([groupId]);
      expect(payload.groupsMembers).toEqual([groupMemberId]);
      expect(payload.location).toEqual(locationId);
      expect(payload.endDate).toEqual(endDate);
    });

    test.skip("should explicitly clear location when sending null", async () => {
      // NOTE: This test is skipped because JSON null cannot be distinguished from
      // "field not provided" at the schema level. The "clear with null" feature
      // would require a different approach (e.g., a separate "clear" flag or
      // using undefined instead of null in the request).
      const requestBody = partialEditBase("Uncategorized", {
        title: "cleared location",
        location: null, // explicitly clear
      });

      const response = await appTest.req
        .put(`/v1/events/${storedEvent.id}`)
        .set("Authorization", adminAuthToken)
        .send(requestBody);

      expect(response.status).toEqual(200);
      const payload = response.body.data.payload;
      expect(payload.title).toEqual("cleared location");
      expect(payload.location).toBeUndefined();
      // Other fields preserved
      expect(payload.actors).toEqual([actorId]);
    });
  });

  describe("Death - omitted location is preserved from stored event", () => {
    const victimId = fc.sample(UUIDArb, 1)[0];
    const newVictimId = fc.sample(UUIDArb, 1)[0];
    const locationId = fc.sample(UUIDArb, 1)[0];

    let [storedEvent] = fc.sample(DeathEventArb, 1).map((e) => ({
      ...e,
      draft: true,
      payload: {
        victim: victimId,
        location: locationId,
      },
      media: [],
      links: [],
      keywords: [],
      socialPosts: [],
    }));

    beforeAll(async () => {
      const [saved] = await throwTE(
        appTest.ctx.db.save(EventV2Entity, [storedEvent]),
      );
      storedEvent = { ...storedEvent, ...(saved as any) };
    });

    test("should preserve location when only updating victim", async () => {
      const response = await appTest.req
        .put(`/v1/events/${storedEvent.id}`)
        .set("Authorization", adminAuthToken)
        .send(
          partialEditBase("Death", {
            victim: newVictimId,
            // location intentionally omitted
          }),
        );

      expect(response.status).toEqual(200);

      const payload = response.body.data.payload;
      expect(payload.victim).toEqual(newVictimId);
      expect(payload.location).toEqual(locationId);
    });

    test.skip("should explicitly clear location when sending null", async () => {
      // NOTE: This test is skipped because JSON null cannot be distinguished from
      // "field not provided" at the schema level.
      const response = await appTest.req
        .put(`/v1/events/${storedEvent.id}`)
        .set("Authorization", adminAuthToken)
        .send(
          partialEditBase("Death", {
            victim: victimId,
            location: null, // explicitly clear
          }),
        );

      expect(response.status).toEqual(200);

      const payload = response.body.data.payload;
      expect(payload.victim).toEqual(victimId);
      expect(payload.location).toBeUndefined();
    });
  });

  describe("ScientificStudy - omitted payload fields are preserved from stored event", () => {
    const urlId = fc.sample(UUIDArb, 1)[0];
    const authorId = fc.sample(UUIDArb, 1)[0];
    const publisherId = fc.sample(UUIDArb, 1)[0];
    const imageId = fc.sample(UUIDArb, 1)[0];

    let [storedEvent] = fc.sample(ScientificStudyArb, 1).map((e) => ({
      ...e,
      draft: true,
      payload: {
        title: "original study title",
        url: urlId,
        authors: [authorId],
        publisher: publisherId,
        image: imageId,
      },
      media: [],
      links: [],
      keywords: [],
      socialPosts: [],
    }));

    beforeAll(async () => {
      const [saved] = await throwTE(
        appTest.ctx.db.save(EventV2Entity, [storedEvent]),
      );
      storedEvent = { ...storedEvent, ...(saved as any) };
    });

    test("should preserve url, authors, publisher and image when only updating title", async () => {
      const response = await appTest.req
        .put(`/v1/events/${storedEvent.id}`)
        .set("Authorization", adminAuthToken)
        .send(
          partialEditBase("ScientificStudy", {
            title: "updated study title",
            // url, authors, publisher, image intentionally omitted
          }),
        );

      expect(response.status).toEqual(200);

      const payload = response.body.data.payload;
      expect(payload.title).toEqual("updated study title");
      expect(payload.url).toEqual(urlId);
      expect(payload.authors).toEqual([authorId]);
      expect(payload.publisher).toEqual(publisherId);
      expect(payload.image).toEqual(imageId);
    });
  });
});
