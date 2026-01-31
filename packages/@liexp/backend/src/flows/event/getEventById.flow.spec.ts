import { pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { UNCATEGORIZED } from "@liexp/io/lib/http/Events/EventType.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { getEventArbitrary } from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";
import fc from "fast-check";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { EventV2Entity } from "../../entities/Event.v2.entity.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import { getEventById } from "./getEventById.flow.js";

type GetEventByIdContext = DatabaseContext;

describe(getEventById.name, () => {
  const appTest = {
    ctx: mockedContext<GetEventByIdContext>({
      db: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should retrieve an event by id", async () => {
    const eventId = uuid();

    const event = fc.sample(getEventArbitrary(UNCATEGORIZED.literals[0]), 1)[0];
    const expectedEvent: EventV2Entity = {
      ...event,
      id: eventId,
      location: null,
      keywords: [],
      media: [],
      actors: [],
      groups: [],
      stories: [],
      links: [],
      socialPosts: [],
      deletedAt: null,
    };

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => expectedEvent);

    const result = await pipe(
      getEventById(eventId, { withDeleted: false })(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.db.findOneOrFail).toHaveBeenCalledWith(EventV2Entity, {
      where: { id: expect.anything() },
      loadRelationIds: {
        relations: ["links", "media", "keywords"],
      },
      withDeleted: false,
    });

    expect(result.id).toBe(eventId);
    expect(result.type).toBe("Uncategorized");
  });

  it("should include deleted events when withDeleted is true", async () => {
    const eventId = uuid();

    const deletedEvent = new EventV2Entity();
    deletedEvent.id = eventId;
    deletedEvent.type = "Uncategorized";
    deletedEvent.deletedAt = new Date();

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => deletedEvent);

    const result = await pipe(
      getEventById(eventId, { withDeleted: true })(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.db.findOneOrFail).toHaveBeenCalledWith(EventV2Entity, {
      where: { id: expect.anything() },
      loadRelationIds: {
        relations: ["links", "media", "keywords"],
      },
      withDeleted: true,
    });

    expect(result.id).toBe(eventId);
    expect(result.deletedAt).toBeDefined();
  });

  it("should load relation ids for links, media, and keywords", async () => {
    const eventId = uuid();
    const linkId = uuid();
    const mediaId = uuid();
    const keywordId = uuid();

    const eventWithRelations = new EventV2Entity();
    eventWithRelations.id = eventId;
    eventWithRelations.type = "Uncategorized";
    eventWithRelations.links = [linkId] as any;
    eventWithRelations.media = [mediaId] as any;
    eventWithRelations.keywords = [keywordId] as any;

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => eventWithRelations);

    const result = await pipe(
      getEventById(eventId, { withDeleted: false })(appTest.ctx),
      throwTE,
    );

    expect(result.links).toEqual([linkId]);
    expect(result.media).toEqual([mediaId]);
    expect(result.keywords).toEqual([keywordId]);
  });
});
