import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { toMediaEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import {
  type CreateSocialPost,
  TO_PUBLISH,
} from "@liexp/shared/lib/io/http/SocialPost.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { CreateSocialPostArb } from "@liexp/test/lib/arbitrary/SocialPost.arbitrary.js";
import { differenceInMinutes, parseISO } from "date-fns";
import { describe, beforeAll, test, expect } from "vitest";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";

describe("Create Social Post", () => {
  let Test: AppTest,
    authorizationToken: string,
    socialPostData: CreateSocialPost;

  beforeAll(async () => {
    Test = await GetAppTest();
    authorizationToken = `Bearer ${Test.ctx.jwt.signUser({
      id: "1",
    } as any)()}`;
  });

  beforeEach(() => {
    [socialPostData] = tests.fc
      .sample(CreateSocialPostArb, 1)
      .map((post) => ({ ...post, schedule: undefined }));
  });

  test("Should create a social post with scheduledAt", async () => {
    const now = new Date();
    const type = "events";
    const id = uuid();

    const response = await Test.req
      .post(`/v1/social-posts/${type}/${id}`)
      .set("Authorization", authorizationToken)
      .send(socialPostData);

    expect(response.status).toEqual(201);

    const { schedule, content, ...expectedSocialPostData } = socialPostData;
    expect(response.body.data).toMatchObject({
      ...expectedSocialPostData,
      status: TO_PUBLISH.literals[0],
    });
    expect(
      differenceInMinutes(parseISO(response.body.data.scheduledAt), now),
    ).toBe(0);
  });

  test("Should create a social post to publish on TG", async () => {
    const type = "events";
    const id = uuid();

    const response = await Test.req
      .post(`/v1/social-posts/${type}/${id}`)
      .set("Authorization", authorizationToken)
      .send({
        ...socialPostData,
        platforms: {
          IG: false,
          TG: true,
        },
      });

    expect(response.status).toEqual(201);
    expect(response.body.data.platforms).toMatchObject({
      TG: true,
      IG: false,
    });
  });

  test("Should create a social post with single media", async () => {
    const type = "events";
    const id = uuid();

    const [media] = tests.fc.sample(MediaArb, 1).map((m) => ({
      ...m,
      type: ImageType.members[0].literals[0],
      events: [],
      links: [],
      keywords: [],
      areas: [],
      featuredInStories: [],
      socialPosts: [],
    }));

    await throwTE(Test.ctx.db.save(MediaEntity, [media]));

    const response = await Test.req
      .post(`/v1/social-posts/${type}/${id}`)
      .set("Authorization", authorizationToken)
      .send({
        ...socialPostData,
        media: [
          {
            id: media.id,
            type: "photo",
            media: media.location,
            thumbnail: media.thumbnail,
          },
        ],
      });

    expect(response.status).toEqual(201);
    expect(response.body.data).toMatchObject({
      media: [
        {
          id: media.id,
          type: "photo",
        },
      ],
    });
  });
});
