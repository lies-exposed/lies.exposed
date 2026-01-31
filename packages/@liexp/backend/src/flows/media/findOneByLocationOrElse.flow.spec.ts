import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/io/lib/http/Common/URL.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { MediaEntity } from "../../entities/Media.entity.js";
import { UserEntity } from "../../entities/User.entity.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import { findOneByLocationOrElse } from "./findOneByLocationOrElse.flow.js";

type FindOneByLocationContext = DatabaseContext;

describe(findOneByLocationOrElse.name, () => {
  const appTest = {
    ctx: mockedContext<FindOneByLocationContext>({
      db: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return existing media when found by location", async () => {
    const imageUrl = "https://example.com/image.jpg" as URL;
    const creator = new UserEntity();
    creator.id = uuid();

    const existingMedia = new MediaEntity();
    existingMedia.id = uuid();
    existingMedia.location = imageUrl;
    existingMedia.label = "Existing Image";

    mockTERightOnce(appTest.ctx.db.findOne, () => fp.O.some(existingMedia));

    const result = await pipe(
      findOneByLocationOrElse(
        { image: imageUrl },
        () => ({}),
        creator,
      )(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.db.findOne).toHaveBeenCalledWith(MediaEntity, {
      where: { location: imageUrl },
    });

    expect(fp.O.isSome(result)).toBe(true);

    if (fp.O.isSome(result)) {
      expect(result.value.id).toBe(existingMedia.id);
      expect(result.value.location).toBe(imageUrl);
    }
  });

  it("should create new media using orElse when not found", async () => {
    const imageUrl = "https://example.com/new-image.jpg" as URL;
    const creator = new UserEntity();
    creator.id = uuid();

    mockTERightOnce(appTest.ctx.db.findOne, () => fp.O.none);

    const result = await pipe(
      findOneByLocationOrElse(
        { image: imageUrl },
        () => ({
          label: "Custom Label",
          description: "Custom Description",
        }),
        creator,
      )(appTest.ctx),
      throwTE,
    );

    expect(fp.O.isSome(result)).toBe(true);

    if (fp.O.isSome(result)) {
      expect(result.value.location).toBe(imageUrl);
      expect(result.value.label).toBe("Custom Label");
      expect(result.value.description).toBe("Custom Description");
      expect(result.value.creator).toBe(creator);
    }
  });

  it("should return None when metadata has no image", async () => {
    const creator = new UserEntity();
    creator.id = uuid();

    const result = await pipe(
      findOneByLocationOrElse(
        { title: "No Image" },
        () => ({}),
        creator,
      )(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.db.findOne).not.toHaveBeenCalled();
    expect(fp.O.isNone(result)).toBe(true);
  });

  it("should return None when image is null", async () => {
    const creator = new UserEntity();
    creator.id = uuid();

    const result = await pipe(
      findOneByLocationOrElse(
        { image: null as any },
        () => ({}),
        creator,
      )(appTest.ctx),
      throwTE,
    );

    expect(fp.O.isNone(result)).toBe(true);
  });

  it("should set default values for new media", async () => {
    const imageUrl = "https://example.com/default-test.png" as URL;
    const creator = new UserEntity();
    creator.id = uuid();

    mockTERightOnce(appTest.ctx.db.findOne, () => fp.O.none);

    const result = await pipe(
      findOneByLocationOrElse(
        { image: imageUrl },
        () => ({}),
        creator,
      )(appTest.ctx),
      throwTE,
    );

    if (fp.O.isSome(result)) {
      expect(result.value.id).toBeDefined();
      expect(result.value.location).toBe(imageUrl);
      expect(result.value.thumbnail).toBe(imageUrl);
      expect(result.value.events).toEqual([]);
      expect(result.value.areas).toEqual([]);
      expect(result.value.links).toEqual([]);
      expect(result.value.keywords).toEqual([]);
      expect(result.value.deletedAt).toBeNull();
    }
  });
});
