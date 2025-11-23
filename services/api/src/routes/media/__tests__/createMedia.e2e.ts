import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { CreateMediaThumbnailPubSub } from "@liexp/backend/lib/pubsub/media/createThumbnail.pubSub.js";
import { ExtractMediaExtraPubSub } from "@liexp/backend/lib/pubsub/media/extractMediaExtra.pubSub.js";
import { type MockUpload } from "@liexp/backend/lib/test/mocks/s3.mock.js";
import { sharpMock } from "@liexp/backend/lib/test/mocks/sharp.mock.js";
import {
  saveUser,
  type UserTest,
} from "@liexp/backend/lib/test/utils/user.utils.js";
import {
  IframeVideoType,
  ImageType,
  MP4Type,
} from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { pipe } from "fp-ts/lib/function.js";
import { type MockInstance } from "vitest";
import { describe, test, expect, beforeAll, vi, beforeEach } from "vitest";
import { mockClear } from "vitest-mock-extended";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe("Create Media", () => {
  let Test: AppTest, authorizationToken: string;
  const users: UserTest[] = [];
  let uploadSpy: MockInstance<new () => MockUpload>;

  beforeAll(async () => {
    Test = await GetAppTest();
    const user = await saveUser(Test.ctx, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
    uploadSpy = vi.spyOn(Test.mocks.s3.classes, "Upload");
  });

  beforeEach(() => {
    Test.mocks.axios.get.mockClear();
    Test.mocks.exifR.load.mockClear();
    Test.mocks.s3.client.send.mockClear();
    Test.mocks.puppeteer.page.goto.mockClear();
    Test.mocks.puppeteer.page.waitForSelector.mockClear();
    Test.mocks.puppeteer.page.$eval.mockClear();
    Test.mocks.redis.publish.mockClear();
    mockClear(sharpMock);
  });

  test("Should create a media from image location", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 1)
      .map(
        (
          {
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            id,
            thumbnail: _thumbnail,
            ...m
          },
          _i,
        ) => ({
          ...m,
          id,
          label: `label-${id}`,
          location: `https://example.com/${id}.jpg`,
          type: ImageType.members[0].literals[0],
          creator: undefined,
        }),
      );

    const uploadThumbLocation = tests.fc.sample(tests.fc.webUrl(), 1)[0];
    uploadSpy.mockImplementation(function () {
      this.done = vi.fn().mockResolvedValueOnce({
        Location: uploadThumbLocation,
      });
    });

    // Mock the HEAD request for media validation
    Test.mocks.axios.get.mockResolvedValueOnce({
      status: 200,
      data: {},
    } as any);

    Test.mocks.redis.publish.mockResolvedValue(1);

    const response = await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send(media);

    expect(response.status).toEqual(200);

    expect(Test.mocks.redis.publish).toHaveBeenCalledWith(
      ExtractMediaExtraPubSub.channel,
      expect.any(String),
    );

    expect(Test.mocks.redis.publish).toHaveBeenCalledWith(
      CreateMediaThumbnailPubSub.channel,
      expect.any(String),
    );
  });

  test("Should create a media from MP4 file location", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 1)
      .map(
        (
          {
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            deletedAt: _deletedAt,
            id,
            thumbnail: _thumbnail,
            ...m
          },
          _i,
        ) => ({
          ...m,
          id,
          label: `label-${id}`,
          location: `https://example.com/${id}.mp4`,
          type: MP4Type.literals[0],
          creator: undefined,
          extra: undefined,
        }),
      );

    const uploadThumbLocation = tests.fc.sample(tests.fc.webUrl(), 1)[0];
    uploadSpy.mockImplementation(function () {
      this.done = vi.fn().mockResolvedValueOnce({
        Location: uploadThumbLocation,
      });
    });

    // Mock the HEAD request for media validation
    Test.mocks.axios.get.mockResolvedValueOnce({
      status: 200,
      data: {},
    } as any);

    Test.mocks.redis.publish.mockResolvedValue(1);

    const response = await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send(media);

    expect(response.status).toEqual(200);

    expect(Test.mocks.redis.publish).toHaveBeenCalledTimes(2);

    expect(response.body.data).toMatchObject({
      ...media,
      id: expect.any(String),
      description: media.description ?? media.label,
      creator: users[0].id,
      extra: {
        width: 0,
        height: expect.any(Number),
        thumbnailWidth: 0,
        thumbnailHeight: 0,
        thumbnails: [],
        needRegenerateThumbnail: false,
      },
      socialPosts: [],
      transferable: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test("Should create a media from iframe/video location", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 1)
      .map(
        (
          {
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            deletedAt: _deletedAt,
            thumbnail: _thumbnail,
            id,
            ...m
          },
          _i,
        ) => ({
          ...m,
          id,
          label: `label-${id}`,
          location: `https://www.youtube.com/watch?v=${id}`,
          type: IframeVideoType.literals[0],
          creator: undefined,
        }),
      );

    // Mock the HEAD request for media validation
    Test.mocks.axios.get.mockResolvedValueOnce({
      status: 200,
      data: {},
    } as any);

    Test.mocks.redis.publish.mockResolvedValue(1);

    const response = await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send(media);

    expect(response.status).toEqual(200);

    expect(Test.mocks.s3.client.send).toHaveBeenCalledTimes(0);

    expect(Test.mocks.redis.publish).toHaveBeenCalledTimes(2);

    expect({
      deletedAt: undefined,
      ...response.body.data,
    }).toMatchObject({
      ...media,
      id: expect.any(String),
      location: `https://www.youtube.com/embed/${media.id}`,
      description: media.description ?? media.label,
      creator: users[0].id,
      extra: {
        width: 0,
        height: 0,
        thumbnailWidth: 0,
        thumbnailHeight: 0,
        thumbnails: [],
        needRegenerateThumbnail: false,
      },
      socialPosts: [],
      transferable: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test("Should get an error when 'location' in media is duplicated", async () => {
    const media = tests.fc
      .sample(MediaArb, 1)
      .map(({ id, createdAt: _createdAt, updatedAt: _updatedAt, ...m }) => ({
        ...m,
        id,
        label: `label-${id}`,
        description: `description-${id}`,
        events: [],
        links: [],
        keywords: [],
        areas: [],
        featuredInStories: [],
        socialPosts: [],
        location: `https://example.com/${id}.jpg`,
        thumbnail: `https://example.com/${id}-thumb.jpg`,
        creator: undefined,
        extra: undefined,
      }));

    await pipe(Test.ctx.db.save(MediaEntity, media), throwTE);

    Test.mocks.axios.get.mockImplementation(() => {
      return Promise.resolve({ data: Buffer.from([]) });
    });

    Test.mocks.redis.publish.mockResolvedValueOnce(1);

    const { id: _id, ...mediaData } = media[0];

    const response = await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send({ ...mediaData, extra: undefined });

    expect(response.status).toBe(500);

    expect(sharpMock.toFormat).not.toHaveBeenCalled();
    expect(sharpMock.toBuffer).not.toHaveBeenCalled();
  });
});
