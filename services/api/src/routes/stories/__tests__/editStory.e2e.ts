import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { toLinkEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { LinkArb } from "@liexp/test/lib/arbitrary/Link.arbitrary.js";
import fc from "fast-check";
import { describe, test, expect, beforeAll } from "vitest";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

/** Minimal body2 document with a link-entity inline referencing `linkId`. */
const makeBody2WithLink = (linkId: string) => [
  {
    id: "block-1",
    type: "paragraph",
    props: {},
    content: [
      {
        type: "link-entity",
        props: { id: linkId, url: "https://example.com", title: "Example" },
      },
    ],
    children: [],
  },
];

const makeStoryBody = (overrides: Record<string, unknown> = {}) => ({
  title: "Test story",
  path: "test-story",
  draft: true,
  date: new Date().toISOString(),
  featuredImage: null,
  body2: [],
  keywords: [],
  links: [],
  groups: [],
  actors: [],
  events: [],
  media: [],
  restore: null,
  ...overrides,
});

describe("Edit Story", () => {
  let Test: AppTest,
    authorizationToken: string,
    user: Awaited<ReturnType<typeof saveUser>>,
    story: StoryEntity;

  beforeAll(async () => {
    Test = await GetAppTest();
    user = await saveUser(Test.ctx, ["event-suggestion:create"]);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;

    // Create a story owned by the user
    const [saved] = await throwTE(
      Test.ctx.db.save(StoryEntity, [
        {
          title: "Initial story",
          path: `story-${Date.now()}`,
          draft: true,
          date: new Date(),
          body: "",
          body2: [],
          creator: { id: user.id },
          keywords: [],
          actors: [],
          groups: [],
          media: [],
          events: [],
          links: [],
        },
      ]),
    );
    story = saved;
  });

  test("Should return 401 when Authorization header is not present", async () => {
    const response = await Test.req.put("/v1/stories/fake-id").send({
      title: "Updated Story",
    });

    expect(response.status).toEqual(401);
  });

  test("Should return 401 when Authorization token has no 'event-suggestion:create' permission", async () => {
    const unprivilegedUser = await saveUser(Test.ctx, []);
    const { authorization } = await loginUser(Test)(unprivilegedUser);

    const response = await Test.req
      .put(`/v1/stories/${story.id}`)
      .set("Authorization", authorization)
      .send(makeStoryBody({ creator: unprivilegedUser.id }));

    expect(response.status).toEqual(401);
  });

  test("Should return 400 when publishing a story that references DRAFT links", async () => {
    const draftLink = toLinkEntity({
      ...fc.sample(LinkArb, 1)[0],
      status: "DRAFT" as const,
    });
    const [savedLink] = await throwTE(
      Test.ctx.db.save(LinkEntity, [draftLink]),
    );

    const response = await Test.req
      .put(`/v1/stories/${story.id}`)
      .set("Authorization", authorizationToken)
      .send(
        makeStoryBody({
          draft: false,
          creator: user.id,
          body2: makeBody2WithLink(savedLink.id),
        }),
      );

    expect(response.status).toEqual(400);
  });

  test("Should allow publishing a story when all related links are APPROVED", async () => {
    const approvedLink = toLinkEntity({
      ...fc.sample(LinkArb, 1)[0],
      status: "APPROVED" as const,
    });
    const [savedLink] = await throwTE(
      Test.ctx.db.save(LinkEntity, [approvedLink]),
    );

    const response = await Test.req
      .put(`/v1/stories/${story.id}`)
      .set("Authorization", authorizationToken)
      .send(
        makeStoryBody({
          draft: false,
          creator: user.id,
          body2: makeBody2WithLink(savedLink.id),
        }),
      );

    expect(response.status).toEqual(200);
    expect(response.body.data.draft).toBe(false);
  });

  test("Should allow saving as draft even when related links are DRAFT", async () => {
    const draftLink = toLinkEntity({
      ...fc.sample(LinkArb, 1)[0],
      status: "DRAFT" as const,
    });
    const [savedLink] = await throwTE(
      Test.ctx.db.save(LinkEntity, [draftLink]),
    );

    const response = await Test.req
      .put(`/v1/stories/${story.id}`)
      .set("Authorization", authorizationToken)
      .send(
        makeStoryBody({
          draft: true,
          creator: user.id,
          body2: makeBody2WithLink(savedLink.id),
        }),
      );

    expect(response.status).toEqual(200);
    expect(response.body.data.draft).toBe(true);
  });
});
