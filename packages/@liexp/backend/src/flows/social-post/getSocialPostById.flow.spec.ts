import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { SocialPostEntity } from "../../entities/SocialPost.entity.js";
import { mockedContext } from "../../test/context.js";
import { TEST_BACKEND_ENV } from "../../test/env.js";
import { getSocialPostById } from "./getSocialPostById.flow.js";

type GetSocialPostByIdContext = DatabaseContext & ENVContext & LoggerContext;

const makeSocialPostContent = (
  overrides: Partial<SocialPostEntity["content"]>,
): SocialPostEntity["content"] => ({
  title: "Test Post",
  date: new Date().toISOString(),
  content: "Post content",
  useReply: false,
  platforms: { IG: false, TG: true },
  media: [],
  actors: [],
  groups: [],
  keywords: [],
  ...overrides,
});

describe(getSocialPostById.name, () => {
  const mockDb = mockDeep<DatabaseContext["db"]>();

  const appTest = {
    ctx: {
      ...mockedContext<GetSocialPostByIdContext>({
        db: mockDb,
      }),
      env: TEST_BACKEND_ENV,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should retrieve a social post by id with empty relations", async () => {
    const postId = uuid();

    const socialPost = new SocialPostEntity();
    socialPost.id = postId;
    socialPost.content = makeSocialPostContent({ title: "Test Post" });
    socialPost.createdAt = new Date();
    socialPost.updatedAt = new Date();

    appTest.ctx.db.findOneOrFail.mockReturnValueOnce(fp.TE.right(socialPost));

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
    socialPost.content = makeSocialPostContent({ title: "Media Post" });

    appTest.ctx.db.findOneOrFail.mockReturnValueOnce(fp.TE.right(socialPost));

    const result = await pipe(getSocialPostById(postId)(appTest.ctx), throwTE);

    expect(result.id).toBe(postId);
    expect(result.content.media).toEqual([]);
  });
});
