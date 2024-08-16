import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { KeywordArb } from "@liexp/test/lib/arbitrary/Keyword.arbitrary.js";
import { LinkArb } from "@liexp/test/lib/arbitrary/Link.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { Equal, In } from "typeorm";
import { describe, test, expect, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Merge Events", () => {
  let Test: AppTest;
  let user: any;
  let authorizationToken: string;
  let event1: any;
  let event2: any;
  let event3: any;
  let keyword1: any;
  let keyword2: any;
  let keyword3: any;
  let link1: any;
  let link2: any;
  let media1: any;
  let media2: any;
  let story: any;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, ["admin:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    // Use alphanumeric suffix only (no dashes) for Tag validation
    const uniqueSuffix = `${Date.now()}${Math.random().toString(36).substring(2, 10)}`;

    // Create keywords with alphanumeric tags (Tag type only allows A-Za-z0-9)
    const [kw1, kw2, kw3] = tests.fc.sample(KeywordArb, 3);
    keyword1 = { ...kw1, tag: `mergekw1${uniqueSuffix}` };
    keyword2 = { ...kw2, tag: `mergekw2${uniqueSuffix}` };
    keyword3 = { ...kw3, tag: `mergekw3${uniqueSuffix}` };
    await throwTE(
      Test.ctx.db.save(KeywordEntity, [keyword1, keyword2, keyword3]),
    );

    // Create links
    const [l1, l2] = tests.fc.sample(LinkArb, 2).map((l, i) => ({
      ...l,
      url: `https://merge-test-${uniqueSuffix}-${i}.example.com`,
      events: [],
      keywords: [],
      socialPosts: [],
      creator: null,
    }));
    link1 = l1;
    link2 = l2;
    await throwTE(Test.ctx.db.save(LinkEntity, [link1, link2]));

    // Create media
    const [m1, m2] = tests.fc.sample(MediaArb, 2).map((m, i) => ({
      ...m,
      label: `merge-test-media-${uniqueSuffix}-${i}`,
      events: [],
      links: [],
      keywords: [],
      stories: [],
      socialPosts: [],
      areas: [],
      featuredInAreas: [],
      featuredInStories: [],
      creator: null,
    }));
    media1 = m1;
    media2 = m2;
    await throwTE(Test.ctx.db.save(MediaEntity, [media1, media2]));

    // Create events with different relations
    const [e1, e2, e3] = tests.fc.sample(UncategorizedArb, 3);

    event1 = {
      ...e1,
      draft: false,
      payload: {
        ...e1.payload,
        actors: [],
        groups: [],
        groupsMembers: [],
      },
      links: [link1],
      media: [media1],
      keywords: [keyword1, keyword2], // keyword2 is shared
      stories: [],
      location: null,
    };

    event2 = {
      ...e2,
      draft: false,
      payload: {
        ...e2.payload,
        actors: [],
        groups: [],
        groupsMembers: [],
      },
      links: [link2],
      media: [media2],
      keywords: [keyword2, keyword3], // keyword2 is shared, should not be duplicated
      stories: [],
      location: null,
    };

    event3 = {
      ...e3,
      draft: false,
      payload: {
        ...e3.payload,
        actors: [],
        groups: [],
        groupsMembers: [],
      },
      links: [],
      media: [],
      keywords: [],
      stories: [],
      location: null,
    };

    await throwTE(Test.ctx.db.save(EventV2Entity, [event1, event2, event3]));

    // Create a story that references event2
    story = {
      id: tests.fc.sample(tests.fc.uuid(), 1)[0],
      path: `merge-test-story-${uniqueSuffix}`,
      title: `Merge Test Story ${uniqueSuffix}`,
      date: new Date(),
      draft: false,
      body: [],
      body2: [],
      events: [event2],
      links: [],
      media: [],
      actors: [],
      groups: [],
      keywords: [],
      featuredImage: null,
      creator: null,
    };
    await throwTE(Test.ctx.db.save(StoryEntity, [story]));
  });

  test("Should return 401 without authentication", async () => {
    await Test.req
      .put("/v1/events")
      .send({
        params: {
          action: "merge",
          ids: [event1.id, event2.id],
          toType: "Uncategorized",
        },
      })
      .expect(401);
  });

  test("Should return 401 when user lacks admin:create permission", async () => {
    const unauthorizedUser = await saveUser(Test.ctx, ["admin:read"]);
    const { authorization } = await loginUser(Test)(unauthorizedUser);

    await Test.req
      .put("/v1/events")
      .set("Authorization", authorization)
      .send({
        params: {
          action: "merge",
          ids: [event1.id, event2.id],
          toType: "Uncategorized",
        },
      })
      .expect(401);
  });

  test("Should return 400 when less than 2 IDs provided", async () => {
    const response = await Test.req
      .put("/v1/events")
      .set("Authorization", authorizationToken)
      .send({
        params: {
          action: "merge",
          ids: [event1.id],
          toType: "Uncategorized",
        },
      });

    expect(response.status).toBe(400);
  });

  test("Should return 404 when event not found", async () => {
    const response = await Test.req
      .put("/v1/events")
      .set("Authorization", authorizationToken)
      .send({
        params: {
          action: "merge",
          ids: [event1.id, "00000000-0000-0000-0000-000000000000"],
          toType: "Uncategorized",
        },
      });

    expect(response.status).toBe(404);
  });

  test("Should merge events successfully", async () => {
    const response = await Test.req
      .put("/v1/events")
      .set("Authorization", authorizationToken)
      .send({
        params: {
          action: "merge",
          ids: [event1.id, event2.id],
          toType: "Uncategorized",
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(event1.id);

    // Verify merged event has combined relations
    const mergedEvent = await throwTE(
      Test.ctx.db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(event1.id) },
        relations: ["links", "media", "keywords"],
      }),
    );

    // Should have links from both events
    expect(mergedEvent.links).toHaveLength(2);
    const linkIds = mergedEvent.links.map((l: any) => l.id);
    expect(linkIds).toContain(link1.id);
    expect(linkIds).toContain(link2.id);

    // Should have media from both events
    expect(mergedEvent.media).toHaveLength(2);
    const mediaIds = mergedEvent.media.map((m: any) => m.id);
    expect(mediaIds).toContain(media1.id);
    expect(mediaIds).toContain(media2.id);

    // Should have keywords from both events without duplicates
    expect(mergedEvent.keywords).toHaveLength(3);
    const keywordIds = mergedEvent.keywords.map((k: any) => k.id);
    expect(keywordIds).toContain(keyword1.id);
    expect(keywordIds).toContain(keyword2.id);
    expect(keywordIds).toContain(keyword3.id);

    // Verify source event is soft-deleted
    await expect(
      throwTE(
        Test.ctx.db.findOneOrFail(EventV2Entity, {
          where: { id: Equal(event2.id) },
        }),
      ),
    ).rejects.toThrow();

    // Verify with withDeleted
    const deletedEvent = await throwTE(
      Test.ctx.db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(event2.id) },
        withDeleted: true,
      }),
    );
    expect(deletedEvent.deletedAt).toBeTruthy();

    // Verify story now references merged event
    const updatedStory = await throwTE(
      Test.ctx.db.findOneOrFail(StoryEntity, {
        where: { id: Equal(story.id) },
        relations: ["events"],
      }),
    );
    const storyEventIds = updatedStory.events.map((e) => e.id);
    expect(storyEventIds).toContain(event1.id);
    expect(storyEventIds).not.toContain(event2.id);
  });

  test("Should merge three events successfully", async () => {
    // Create fresh events for this test using minimal structure
    const freshEvent1Id = tests.fc.sample(tests.fc.uuid(), 1)[0];
    const freshEvent2Id = tests.fc.sample(tests.fc.uuid(), 1)[0];
    const freshEvent3Id = tests.fc.sample(tests.fc.uuid(), 1)[0];

    const freshEvent1 = {
      id: freshEvent1Id,
      type: "Uncategorized",
      draft: false,
      date: new Date(),
      payload: {
        title: "Fresh Event 1",
        actors: [],
        groups: [],
        groupsMembers: [],
      },
      links: [],
      media: [],
      keywords: [],
      location: null,
    };

    const freshEvent2 = {
      id: freshEvent2Id,
      type: "Uncategorized",
      draft: false,
      date: new Date(),
      payload: {
        title: "Fresh Event 2",
        actors: [],
        groups: [],
        groupsMembers: [],
      },
      links: [],
      media: [],
      keywords: [],
      location: null,
    };

    const freshEvent3 = {
      id: freshEvent3Id,
      type: "Uncategorized",
      draft: false,
      date: new Date(),
      payload: {
        title: "Fresh Event 3",
        actors: [],
        groups: [],
        groupsMembers: [],
      },
      links: [],
      media: [],
      keywords: [],
      location: null,
    };

    await throwTE(
      Test.ctx.db.save(EventV2Entity, [
        freshEvent1,
        freshEvent2,
        freshEvent3,
      ] as any[]),
    );

    const response = await Test.req
      .put("/v1/events")
      .set("Authorization", authorizationToken)
      .send({
        params: {
          action: "merge",
          ids: [freshEvent1.id, freshEvent2.id, freshEvent3.id],
          toType: "Uncategorized",
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(freshEvent1.id);

    // Verify both source events are soft-deleted
    const deletedEvents = await throwTE(
      Test.ctx.db.find(EventV2Entity, {
        where: { id: In([freshEvent2.id, freshEvent3.id]) },
        withDeleted: true,
      }),
    );
    expect(deletedEvents).toHaveLength(2);
    expect(deletedEvents.every((e) => e.deletedAt !== null)).toBe(true);
  });
});
