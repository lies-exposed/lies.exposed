import { IframeVideoType } from "@liexp/shared/lib/io/http/Media.js";
import { MediaArb } from "@liexp/shared/lib/tests/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser, saveUser } from "../../../../test/user.utils.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { UserEntity } from "#entities/User.entity.js";

describe("Create Media", () => {
  let Test: AppTest, authorizationToken: string;
  const mediaIds: string[] = [];
  const users: any[] = [];

  beforeAll(async () => {
    Test = await GetAppTest();
    const user = await saveUser(Test, ["admin:create"]);
    users.push(user);
    const { authorization } = await loginUser(Test)(user);
    authorizationToken = authorization;
  });

  afterAll(async () => {
    await throwTE(Test.ctx.db.delete(MediaEntity, mediaIds));
    await throwTE(
      Test.ctx.db.delete(
        UserEntity,
        users.map((u) => u.id),
      ),
    );

    await Test.utils.e2eAfterAll();
  });

  beforeEach(() => {
    Test.mocks.axios.get.mockClear();
    Test.mocks.s3.client.send.mockClear();
    Test.mocks.s3.classes.Upload.mockClear();
    Test.mocks.puppeteer.page.goto.mockClear();
    Test.mocks.puppeteer.page.waitForSelector.mockClear();
    Test.mocks.puppeteer.page.$eval.mockClear();
  });

  test("Should create a media from MP4 file location", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 1)
      .map(({ createdAt, updatedAt, id, ...m }, i) => ({
        ...m,
        label: `label-${id}`,
        location: `https://example.com/${id}.mp4`,
        creator: undefined,
      }));

    Test.mocks.axios.get.mockImplementation(() => {
      return Promise.resolve({ data: Buffer.from([]) });
    });

    const sharpMock = {
      resize: vitest.fn().mockReturnThis(),
      toFormat: vitest.fn().mockReturnThis(),
      toBuffer: vitest.fn().mockResolvedValueOnce(Buffer.from([])),
    };

    Test.mocks.sharp.mockImplementation(() => {
      return sharpMock;
    });

    const uploadThumbLocation = tests.fc.sample(tests.fc.webUrl(), 1)[0];
    Test.mocks.s3.classes.Upload.mockReset().mockImplementation(() => ({
      done: vi.fn().mockResolvedValueOnce({
        Location: uploadThumbLocation,
      }),
    }));

    const response = await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send(media);

    expect(Test.mocks.axios.get).toHaveBeenCalledTimes(1);
    expect(Test.mocks.sharp).toHaveBeenCalledTimes(1);
    expect(sharpMock.resize).toHaveBeenCalledWith({
      width: 640,
      withoutEnlargement: true,
    });
    expect(sharpMock.toFormat).toHaveBeenCalledWith("png");
    expect(sharpMock.toBuffer).toHaveBeenCalledTimes(1);

    expect(response.status).toEqual(200);

    expect({
      extra: undefined,
      deletedAt: undefined,
      ...response.body.data,
    }).toMatchObject({
      ...media,
      id: expect.any(String),
      description: media.description ?? media.label,
      thumbnail: uploadThumbLocation,
      creator: users[0].id,
      socialPosts: [],
      transferable: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    mediaIds.push(response.body.data.id);
  });

  test("Should create a media from iframe/video location", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 1)
      .map(({ createdAt, updatedAt, id, ...m }, i) => ({
        ...m,
        id,
        label: `label-${id}`,
        location: `https://www.youtube.com/watch?v=${id}`,
        type: IframeVideoType.value,
        creator: undefined,
      }));

    Test.mocks.axios.get.mockImplementation(() => {
      return Promise.resolve({ data: Buffer.from([]) });
    });

    Test.mocks.puppeteer.page.goto.mockImplementation(() => {
      return Promise.resolve();
    });
    Test.mocks.puppeteer.page.waitForSelector.mockImplementation(() => {
      return Promise.resolve();
    });
    const uploadThumbLocation = "https://example.com/thumbnail.jpg";
    Test.mocks.puppeteer.page.$eval.mockImplementation(() => {
      return Promise.resolve(uploadThumbLocation);
    });

    Test.mocks.s3.classes.Upload.mockReset().mockImplementation(() => ({
      done: vi.fn().mockResolvedValueOnce({
        Location: "https://example.com/thumbnail.jpg",
      }),
    }));

    const response = await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send(media);

    expect(response.status).toEqual(200);

    // fetch thumbnail from youtube
    expect(Test.mocks.axios.get).toHaveBeenCalledTimes(1);

    expect(Test.mocks.s3.client.send).toHaveBeenCalledTimes(0);

    expect({
      extra: undefined,
      deletedAt: undefined,
      ...response.body.data,
    }).toMatchObject({
      ...media,
      id: expect.any(String),
      location: `https://www.youtube.com/embed/${media.id}`,
      description: media.description ?? media.label,
      thumbnail: uploadThumbLocation,
      creator: users[0].id,
      socialPosts: [],
      transferable: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    mediaIds.push(response.body.data.id);
  });

  test("Should get an error when 'location' in media is duplicated", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 100)
      .map(({ id, createdAt, updatedAt, ...m }) => ({
        ...m,
        location: `https://example.com/${id}.jpg`,
        creator: undefined,
      }));

    const sharpMock = {
      resize: vitest.fn().mockReturnThis(),
      toFormat: vitest.fn().mockReturnThis(),
      toBuffer: vitest.fn().mockResolvedValueOnce(Buffer.from([])),
    };
    Test.mocks.sharp.mockImplementation(() => {
      return sharpMock;
    });

    const response = await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send(media);

    Test.mocks.axios.get.mockImplementationOnce(() => {
      return Promise.resolve({ data: Buffer.from([]) });
    });

    expect(sharpMock.resize).toHaveBeenCalledWith({
      width: 640,
      withoutEnlargement: true,
    });
    expect(sharpMock.toFormat).toHaveBeenCalledWith("png");
    expect(sharpMock.toBuffer).toHaveBeenCalledTimes(1);

    Test.mocks.s3.client.send.mockImplementation(() => {
      return Promise.resolve({
        Location: tests.fc.sample(tests.fc.webUrl(), 1)[0],
      });
    });

    expect(response.status).toEqual(200);

    mediaIds.push(response.body.data.id);

    await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send(media)
      .expect(500);
  });
});
