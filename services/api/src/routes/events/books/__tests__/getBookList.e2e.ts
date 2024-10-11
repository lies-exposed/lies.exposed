import { BookEventArb } from "@liexp/shared/lib/tests/arbitrary/events/BookEvent.arbitrary.js";
import { ActorArb, GroupArb } from "@liexp/shared/lib/tests/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { fc } from "@liexp/test";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";

describe("Get Book List", () => {
  let appTest: AppTest;
  const eventsData = fc.sample(BookEventArb, 100).map((e) => ({
    ...e,
    draft: false,
    media: [],
    links: [],
    keywords: [],
  }));

  beforeAll(async () => {
    appTest = await GetAppTest();

    await throwTE(appTest.ctx.db.save(EventV2Entity, eventsData as any[]));
  });

  afterAll(async () => {
    await throwTE(
      appTest.ctx.db.delete(
        EventV2Entity,
        eventsData.map((e) => e.id),
      ),
    );
    await appTest.utils.e2eAfterAll();
  });

  test("Should return the book list", async () => {
    const response = await appTest.req.get(`/v1/books`);

    const body = response.body;
    expect(response.status).toEqual(200);
    expect(body.data).toHaveLength(20);
    expect(body.total).toBeGreaterThanOrEqual(100);
  });

  test("Should return books by actor", async () => {
    const actor = fc.sample(ActorArb, 1)[0];

    await throwTE(appTest.ctx.db.save(ActorEntity, [actor as any]));

    const [eventWithActor] = eventsData;
    await throwTE(
      appTest.ctx.db.save(EventV2Entity, [
        {
          ...eventWithActor,
          payload: {
            ...eventWithActor.payload,
            authors: [{ type: "Actor", id: actor.id }],
          },
        },
      ]),
    );

    const response = await appTest.req.get(`/v1/books`).query({
      "actors[]": actor.id,
    });
    const body = response.body;
    expect(response.status).toEqual(200);
    expect(body.data).toHaveLength(1);
    expect(body.total).toBeGreaterThanOrEqual(1);
  });

  test("Should return books by group", async () => {
    const group = fc.sample(GroupArb, 1)[0];

    await throwTE(appTest.ctx.db.save(GroupEntity, [group as any]));

    const [eventWithActor] = eventsData;
    await throwTE(
      appTest.ctx.db.save(EventV2Entity, [
        {
          ...eventWithActor,
          payload: {
            ...eventWithActor.payload,
            authors: [{ type: "Group", id: group.id }],
          },
        },
      ]),
    );

    const response = await appTest.req.get(`/v1/books`).query({
      "groups[]": group.id,
    });
    const body = response.body;
    expect(response.status).toEqual(200);
    expect(body.data).toHaveLength(1);
    expect(body.total).toBeGreaterThanOrEqual(1);
  });

  test("Should return books by either actor and group", async () => {
    const actor = fc.sample(ActorArb, 1)[0];
    const group = fc.sample(GroupArb, 1)[0];

    await throwTE(appTest.ctx.db.save(ActorEntity, [actor as any]));
    await throwTE(appTest.ctx.db.save(GroupEntity, [group as any]));

    const [eventWithActor] = eventsData;
    await throwTE(
      appTest.ctx.db.save(EventV2Entity, [
        {
          ...eventWithActor,
          payload: {
            ...eventWithActor.payload,
            authors: [
              { type: "Group", id: group.id },
              { type: "Actor", id: actor.id },
            ],
          },
        },
      ]),
    );

    const response = await appTest.req.get(`/v1/books`).query({
      "actors[]": [actor.id],
      "groups[]": [group.id],
    });
    const body = response.body;
    expect(response.status).toEqual(200);
    expect(body.data).toHaveLength(1);
    expect(body.total).toBeGreaterThanOrEqual(1);
  });
});
