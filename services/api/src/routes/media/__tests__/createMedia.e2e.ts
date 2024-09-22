import { writeFileSync } from "fs";
import path from "path";
import { Stream } from "stream";
import {
  IframeVideoType,
  ImageType,
  MP4Type,
} from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { MediaArb } from "@liexp/shared/lib/tests/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as tests from "@liexp/test";
import { pipe } from "fp-ts/lib/function.js";
import { mockClear } from "vitest-mock-extended";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { ffmpegCommandMock } from "../../../../test/__mocks__/ffmpeg.mock.js";
import { sharpMock } from "../../../../test/__mocks__/sharp.mock.js";
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
    Test.mocks.exifR.load.mockClear();
    Test.mocks.s3.client.send.mockClear();
    Test.mocks.s3.classes.Upload.mockClear();
    Test.mocks.puppeteer.page.goto.mockClear();
    Test.mocks.puppeteer.page.waitForSelector.mockClear();
    Test.mocks.puppeteer.page.$eval.mockClear();
    Test.mocks.sharp.mockClear();
    mockClear(sharpMock);
  });

  test("Should create a media from image location", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 1)
      .map(({ createdAt, updatedAt, id, ...m }, i) => ({
        ...m,
        id,
        label: `label-${id}`,
        location: `https://example.com/${id}.jpg`,
        thumbnail: undefined,
        type: ImageType.types[0].value,
        creator: undefined,
      }));

    // location as buffer
    Test.mocks.axios.get.mockImplementation(() => {
      return Promise.resolve({ data: Buffer.from([]) });
    });

    Test.mocks.exifR.load.mockResolvedValueOnce({
      ["Image Width"]: {
        value: 2000,
        description: "Image Width",
      },
      ["Image Height"]: {
        value: 1000,
        description: "Image Height",
      },
    } as any);

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

    expect(response.status).toEqual(200);

    mediaIds.push(response.body.data.id);
  });

  test("Should create a media from MP4 file location", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 1)
      .map(({ createdAt, updatedAt, deletedAt, id, ...m }, i) => ({
        ...m,
        id,
        label: `label-${id}`,
        location: `https://example.com/${id}.mp4`,
        type: MP4Type.value,
        creator: undefined,
        extra: undefined,
      }));

    Test.mocks.axios.get
      // download video (stream)
      .mockResolvedValueOnce({ data: Stream.Duplex.from([]) })
      // download thumbnail (buffer)
      .mockResolvedValueOnce({ data: Buffer.from([]) });

    ffmpegCommandMock.on.mockImplementation(function (
      this: typeof ffmpegCommandMock,
      event,
      cb,
    ) {
      if (event === "end") {
        for (let i = 0; i <= this._screenshots.count; i++) {
          writeFileSync(
            path.resolve(
              this._screenshots.folder,
              this._screenshots.filename.replace("%i", i.toString()),
            ),
            "",
          );
        }

        cb();
      }
    });

    Test.mocks.ffmpeg.ffprobe.mockImplementation((file, cb: any) => {
      cb(null, {
        streams: [{ width: 600, height: 400 }],
        format: {
          duration: 1000,
        },
      });
    });

    Test.mocks.sharp.mockImplementation(() => {
      return sharpMock;
    });

    Test.mocks.exifR.load.mockResolvedValue({
      ["Image Width"]: {
        value: 300,
        description: "Image Width",
      },
      ["Image Height"]: {
        value: 100,
        description: "Image Height",
      },
    } as any);

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

    expect(response.status).toEqual(200);

    expect(Test.mocks.axios.get).toHaveBeenCalledTimes(2);
    expect(Test.mocks.sharp).toHaveBeenCalledTimes(2);
    expect(sharpMock.resize).toHaveBeenCalledWith({
      width: 300,
      fit: "cover",
      withoutEnlargement: true,
    });
    expect(sharpMock.toFormat).toHaveBeenCalledWith("png");
    expect(sharpMock.toBuffer).toHaveBeenCalledTimes(2);

    expect(response.body.data).toMatchObject({
      ...media,
      id: expect.any(String),
      description: media.description ?? media.label,
      thumbnail: uploadThumbLocation,
      creator: users[0].id,
      extra: {
        width: 600,
        height: expect.any(Number),
        thumbnailWidth: 300,
        thumbnailHeight: 100,
        thumbnails: [uploadThumbLocation, uploadThumbLocation],
        needRegenerateThumbnail: false,
      },
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
      .map(({ createdAt, updatedAt, deletedAt, id, ...m }, i) => ({
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

    // fetch thumbnail from youtube and read its exif metadata
    expect(Test.mocks.axios.get).toHaveBeenCalledTimes(2);

    expect(Test.mocks.s3.client.send).toHaveBeenCalledTimes(0);

    expect({
      deletedAt: undefined,
      ...response.body.data,
    }).toMatchObject({
      ...media,
      id: expect.any(String),
      location: `https://www.youtube.com/embed/${media.id}`,
      description: media.description ?? media.label,
      thumbnail: uploadThumbLocation,
      creator: users[0].id,
      extra: {
        width: 0,
        height: 0,
        thumbnailWidth: 300,
        thumbnailHeight: 100,
        thumbnails: ["https://example.com/thumbnail.jpg"],
        needRegenerateThumbnail: false,
      },
      socialPosts: [],
      transferable: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    mediaIds.push(response.body.data.id);
  });

  test("Should get an error when 'location' in media is duplicated", async () => {
    const media = tests.fc
      .sample(MediaArb, 1)
      .map(({ id, createdAt, updatedAt, ...m }) => ({
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

    const mIds = await pipe(Test.ctx.db.save(MediaEntity, media), throwTE).then(
      (m) => m.map((m) => m.id),
    );

    Test.mocks.axios.get.mockImplementationOnce(() => {
      return Promise.resolve({ data: Buffer.from([]) });
    });

    // const response = await Test.req
    //   .post("/v1/media")
    //   .set("Authorization", authorizationToken)
    //   .send(media);

    mediaIds.push(...mIds);

    const response = await Test.req
      .post("/v1/media")
      .set("Authorization", authorizationToken)
      .send({ ...media[0], extra: undefined });

    expect(response.status).toBe(500);

    expect(sharpMock.toFormat).not.toHaveBeenCalled();
    expect(sharpMock.toBuffer).not.toHaveBeenCalled();
  });
});
