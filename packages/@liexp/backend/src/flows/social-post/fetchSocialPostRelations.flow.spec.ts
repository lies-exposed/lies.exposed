import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { ActorEntity } from "../../entities/Actor.entity.js";
import { GroupEntity } from "../../entities/Group.entity.js";
import { KeywordEntity } from "../../entities/Keyword.entity.js";
import { MediaEntity } from "../../entities/Media.entity.js";
import { mockedContext } from "../../test/context.js";
import { fetchSocialPostRelations } from "./fetchSocialPostRelations.flow.js";

// Mock the underlying fetchRelations query so we can control its output
// without needing real query builders.
vi.mock("../../queries/common/fetchRelations.query.js", () => ({
  fetchRelations: vi.fn(),
}));

import { fetchRelations } from "../../queries/common/fetchRelations.query.js";

type TestContext = DatabaseContext & ENVContext & LoggerContext;

describe(fetchSocialPostRelations.name, () => {
  const appTest = {
    ctx: {
      ...mockedContext<TestContext>({ db: mock() }),
      env: { DEFAULT_PAGE_SIZE: 20 } as any,
    },
  };

  const emptyRelationsResult = {
    actors: [],
    groups: [],
    keywords: [],
    media: [],
    links: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty relations when all content fields are null", async () => {
    vi.mocked(fetchRelations).mockReturnValue(() =>
      fp.TE.right(emptyRelationsResult),
    );

    const result = await pipe(
      fetchSocialPostRelations({
        actors: null as any,
        groups: null as any,
        keywords: null as any,
        media: null as any,
      })(appTest.ctx),
      throwTE,
    );

    expect(result.actors).toEqual([]);
    expect(result.groups).toEqual([]);
    expect(result.keywords).toEqual([]);
    expect(result.media).toEqual([]);
  });

  it("should return empty relations when all content arrays are empty", async () => {
    vi.mocked(fetchRelations).mockReturnValue(() =>
      fp.TE.right(emptyRelationsResult),
    );

    const result = await pipe(
      fetchSocialPostRelations({
        actors: [],
        groups: [],
        keywords: [],
        media: [],
      })(appTest.ctx),
      throwTE,
    );

    expect(result.actors).toEqual([]);
    expect(result.groups).toEqual([]);
    expect(result.keywords).toEqual([]);
    expect(result.media).toEqual([]);
    expect(fetchRelations).toHaveBeenCalledOnce();
  });

  it("should pass actor UUIDs to fetchRelations and return actor entities", async () => {
    const actorId = uuid();
    const actor = new ActorEntity();
    actor.id = actorId;
    actor.fullName = "Test Actor";

    vi.mocked(fetchRelations).mockReturnValue(() =>
      fp.TE.right({ ...emptyRelationsResult, actors: [actor] }),
    );

    const result = await pipe(
      fetchSocialPostRelations({
        actors: [actorId],
        groups: [],
        keywords: [],
        media: [],
      })(appTest.ctx),
      throwTE,
    );

    expect(result.actors).toHaveLength(1);
    expect(result.actors[0].id).toBe(actorId);
    expect(fetchRelations).toHaveBeenCalledOnce();
  });

  it("should pass group UUIDs to fetchRelations and return group entities", async () => {
    const groupId = uuid();
    const group = new GroupEntity();
    group.id = groupId;
    group.name = "Test Group";

    vi.mocked(fetchRelations).mockReturnValue(() =>
      fp.TE.right({ ...emptyRelationsResult, groups: [group] }),
    );

    const result = await pipe(
      fetchSocialPostRelations({
        actors: [],
        groups: [groupId],
        keywords: [],
        media: [],
      })(appTest.ctx),
      throwTE,
    );

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].id).toBe(groupId);
  });

  it("should pass keyword UUIDs to fetchRelations and return keyword entities", async () => {
    const keywordId = uuid();
    const keyword = new KeywordEntity();
    keyword.id = keywordId;
    keyword.tag = "test-keyword";

    vi.mocked(fetchRelations).mockReturnValue(() =>
      fp.TE.right({ ...emptyRelationsResult, keywords: [keyword] }),
    );

    const result = await pipe(
      fetchSocialPostRelations({
        actors: [],
        groups: [],
        keywords: [keywordId],
        media: [],
      })(appTest.ctx),
      throwTE,
    );

    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].id).toBe(keywordId);
  });

  it("should pass media UUIDs to fetchRelations and return media entities", async () => {
    const mediaId = uuid();
    const media = new MediaEntity();
    media.id = mediaId;
    media.label = "test-media";

    vi.mocked(fetchRelations).mockReturnValue(() =>
      fp.TE.right({ ...emptyRelationsResult, media: [media] }),
    );

    const result = await pipe(
      fetchSocialPostRelations({
        actors: [],
        groups: [],
        keywords: [],
        media: [mediaId],
      })(appTest.ctx),
      throwTE,
    );

    expect(result.media).toHaveLength(1);
    expect(result.media[0].id).toBe(mediaId);
  });

  it("should return combined relations for all content types populated", async () => {
    const actorId = uuid();
    const groupId = uuid();
    const keywordId = uuid();
    const mediaId = uuid();

    const actor = new ActorEntity();
    actor.id = actorId;
    const group = new GroupEntity();
    group.id = groupId;
    const keyword = new KeywordEntity();
    keyword.id = keywordId;
    const media = new MediaEntity();
    media.id = mediaId;

    vi.mocked(fetchRelations).mockReturnValue(() =>
      fp.TE.right({
        actors: [actor],
        groups: [group],
        keywords: [keyword],
        media: [media],
        links: [],
      }),
    );

    const result = await pipe(
      fetchSocialPostRelations({
        actors: [actorId],
        groups: [groupId],
        keywords: [keywordId],
        media: [mediaId],
      })(appTest.ctx),
      throwTE,
    );

    expect(result.actors).toHaveLength(1);
    expect(result.groups).toHaveLength(1);
    expect(result.keywords).toHaveLength(1);
    expect(result.media).toHaveLength(1);
  });

  it("should propagate errors from fetchRelations as Left", async () => {
    const dbError = { name: "DBError", message: "connection failed" };

    vi.mocked(fetchRelations).mockReturnValue(() =>
      fp.TE.left(dbError as any),
    );

    const te = fetchSocialPostRelations({
      actors: [uuid()],
      groups: [],
      keywords: [],
      media: [],
    })(appTest.ctx);

    const outcome = await te();

    expect(outcome._tag).toBe("Left");
    expect((outcome as any).left).toEqual(dbError);
  });

  it("should call fetchRelations with isAdmin=true", async () => {
    vi.mocked(fetchRelations).mockReturnValue(() =>
      fp.TE.right(emptyRelationsResult),
    );

    await pipe(
      fetchSocialPostRelations({
        actors: [],
        groups: [],
        keywords: [],
        media: [],
      })(appTest.ctx),
      throwTE,
    );

    // fetchRelations is called with the relations object and isAdmin=true
    expect(fetchRelations).toHaveBeenCalledWith(expect.any(Object), true);
  });
});
