import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { AreaArb } from "@liexp/test/lib/arbitrary/Area.arbitrary.js";
import fc from "fast-check";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { type GeocodeProviderContext } from "../../context/index.js";
import { AreaEntity } from "../../entities/Area.entity.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import { editArea } from "./editArea.flow.js";

type EditAreaContext = DatabaseContext & GeocodeProviderContext;

describe(editArea.name, () => {
  const appTest = {
    ctx: mockedContext<EditAreaContext>({
      db: mock(),
      geo: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should edit an area without geometry update", async () => {
    const [existingArea] = fc.sample(AreaArb, 1);
    const areaId = uuid();
    const newLabel = "Updated Label";

    const expectedSavedArea = {
      ...existingArea,
      id: areaId,
      label: newLabel,
      media: [],
      events: [],
      featuredImage: null,
      socialPosts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTERightOnce(appTest.ctx.db.save, () => [expectedSavedArea]);

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => expectedSavedArea);

    const result: any = await pipe(
      editArea({
        id: areaId,
        label: fp.O.some(newLabel),
        slug: fp.O.none,
        draft: fp.O.none,
        geometry: fp.O.none,
        body: fp.O.none,
        featuredImage: fp.O.none,
        media: [],
        events: fp.O.none,
        updateGeometry: fp.O.none,
      })(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.db.save).toHaveBeenCalledWith(
      AreaEntity,
      expect.arrayContaining([
        expect.objectContaining({
          id: areaId,
          label: newLabel,
        }),
      ]),
    );

    expect(result.id).toBe(areaId);
  });

  it("should edit an area with geometry update via geocoding", async () => {
    const [existingArea] = fc.sample(AreaArb, 1);
    const areaId = uuid();
    const newLabel = "Rome, Italy";

    const geocodedCoordinates = {
      lon: "12.4964",
      lat: "41.9028",
    };

    const expectedGeometry = {
      type: "Point" as const,
      coordinates: [+geocodedCoordinates.lon, +geocodedCoordinates.lat],
    };

    const expectedSavedArea = {
      ...existingArea,
      id: areaId,
      label: newLabel,
      geometry: expectedGeometry,
      media: [],
      events: [],
      featuredImage: null,
      socialPosts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    appTest.ctx.geo.search.mockReturnValueOnce(
      fp.TE.right([geocodedCoordinates]),
    );

    mockTERightOnce(appTest.ctx.db.save, () => [expectedSavedArea]);

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => expectedSavedArea);

    const result: any = await pipe(
      editArea({
        id: areaId,
        label: fp.O.some(newLabel),
        slug: fp.O.none,
        draft: fp.O.none,
        geometry: fp.O.none,
        body: fp.O.none,
        featuredImage: fp.O.none,
        media: [],
        events: fp.O.none,
        updateGeometry: fp.O.some(true),
      })(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.geo.search).toHaveBeenCalledWith(newLabel);

    expect(appTest.ctx.db.save).toHaveBeenCalledWith(
      AreaEntity,
      expect.arrayContaining([
        expect.objectContaining({
          id: areaId,
          label: newLabel,
          geometry: expectedGeometry,
        }),
      ]),
    );

    expect(result.id).toBe(areaId);
    expect(result.geometry).toEqual(expectedGeometry);
  });

  it("should edit an area with events relation", async () => {
    const [existingArea] = fc.sample(AreaArb, 1);
    const areaId = uuid();
    const eventId1 = uuid();
    const eventId2 = uuid();

    const expectedSavedArea = {
      ...existingArea,
      id: areaId,
      media: [],
      events: [eventId1, eventId2],
      featuredImage: null,
      socialPosts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTERightOnce(appTest.ctx.db.save, () => [expectedSavedArea]);

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => expectedSavedArea);

    const result: any = await pipe(
      editArea({
        id: areaId,
        label: fp.O.none,
        slug: fp.O.none,
        draft: fp.O.none,
        geometry: fp.O.none,
        body: fp.O.none,
        featuredImage: fp.O.none,
        media: [],
        events: fp.O.some([eventId1, eventId2]),
        updateGeometry: fp.O.none,
      })(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.db.save).toHaveBeenCalledWith(
      AreaEntity,
      expect.arrayContaining([
        expect.objectContaining({
          id: areaId,
          events: [{ id: eventId1 }, { id: eventId2 }],
        }),
      ]),
    );

    expect(result.id).toBe(areaId);
    expect(result.events).toEqual([eventId1, eventId2]);
  });

  it("should edit an area with featured image", async () => {
    const [existingArea] = fc.sample(AreaArb, 1);
    const areaId = uuid();
    const featuredImageId = uuid();

    const expectedSavedArea = {
      ...existingArea,
      id: areaId,
      media: [],
      events: [],
      featuredImage: {
        id: featuredImageId,
        label: "Featured Image",
        location: "https://example.com/image.jpg",
        type: "image/png",
        description: null,
        thumbnail: null,
        extra: null,
        creator: null,
        keywords: [],
        events: [],
        links: [],
        areas: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      },
      socialPosts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTERightOnce(appTest.ctx.db.save, () => [expectedSavedArea]);

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => expectedSavedArea);

    const result: any = await pipe(
      editArea({
        id: areaId,
        label: fp.O.none,
        slug: fp.O.none,
        draft: fp.O.none,
        geometry: fp.O.none,
        body: fp.O.none,
        featuredImage: fp.O.some(featuredImageId),
        media: [],
        events: fp.O.none,
        updateGeometry: fp.O.none,
      })(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.db.save).toHaveBeenCalledWith(
      AreaEntity,
      expect.arrayContaining([
        expect.objectContaining({
          id: areaId,
          featuredImage: { id: featuredImageId },
        }),
      ]),
    );

    expect(result.id).toBe(areaId);
    expect(result.featuredImage).not.toBeNull();
    expect(result.featuredImage.id).toBe(featuredImageId);
  });

  it("should skip geocoding when updateGeometry is false", async () => {
    const [existingArea] = fc.sample(AreaArb, 1);
    const areaId = uuid();
    const newLabel = "New Label";

    const expectedSavedArea = {
      ...existingArea,
      id: areaId,
      label: newLabel,
      media: [],
      events: [],
      featuredImage: null,
      socialPosts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockTERightOnce(appTest.ctx.db.save, () => [expectedSavedArea]);

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => expectedSavedArea);

    await pipe(
      editArea({
        id: areaId,
        label: fp.O.some(newLabel),
        slug: fp.O.none,
        draft: fp.O.none,
        geometry: fp.O.none,
        body: fp.O.none,
        featuredImage: fp.O.none,
        media: [],
        events: fp.O.none,
        updateGeometry: fp.O.some(false),
      })(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.geo.search).not.toHaveBeenCalled();
  });
});
