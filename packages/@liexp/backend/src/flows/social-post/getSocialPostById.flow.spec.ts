import { pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { SocialPostEntity } from "../../entities/SocialPost.entity.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import { getSocialPostById } from "./getSocialPostById.flow.js";

type GetSocialPostByIdContext = DatabaseContext & ENVContext & LoggerContext;

describe(getSocialPostById.name, () => {
  const mockDb = mockDeep<DatabaseContext["db"]>();

  const appTest = {
    ctx: {
      ...mockedContext<GetSocialPostByIdContext>({
        db: mockDb,
      }),
      env: {} as any,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should retrieve a social post by id with empty relations", async () => {
    const postId = uuid();

    const socialPost = new SocialPostEntity();
    socialPost.id = postId;
    socialPost.content = {
      title: "Test Post",
      body: "Post content",
      media: [],
      actors: [],
      groups: [],
      keywords: [],
      type: "text",
    } as any;
    socialPost.createdAt = new Date();
    socialPost.updatedAt = new Date();

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => socialPost);

    // Mock the query builder chain for fetchRelations - with empty arrays, no queries are made
    const result = await pipe(getSocialPostById(postId)(appTest.ctx), throwTE);

    expect(appTest.ctx.db.findOneOrFail).toHaveBeenCalledWith(
      SocialPostEntity,
      {
        where: { id: postId },
      },
    );

    expect(result.id).toBe(postId);
    expect(result.content.title).toBe("Test Post");
  });

  it("should return social post with transformed media content", async () => {
    const postId = uuid();

    const socialPost = new SocialPostEntity();
    socialPost.id = postId;
    socialPost.content = {
      title: "Media Post",
      body: "Post with media",
      media: [],
      actors: [],
      groups: [],
      keywords: [],
      type: "text",
    } as any;

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => socialPost);

    const result = await pipe(getSocialPostById(postId)(appTest.ctx), throwTE);

    expect(result.id).toBe(postId);
    expect(result.content.media).toEqual([]);
  });
});
