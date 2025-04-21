import { fp } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import {
  IframeVideoType,
  ImageType,
  MP4Type,
} from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import * as tests from "@liexp/test/lib/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockClear, mockDeep } from "vitest-mock-extended";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import { sharpMock } from "../../test/mocks/sharp.mock.js";
import { mocks } from "../../test/mocks.js";
import {
  createAndUpload,
  type CreateAndUploadFlowContext,
} from "./createAndUpload.flow.js";

describe(createAndUpload.name, () => {
  const Test = {
    ctx: mockedContext<CreateAndUploadFlowContext>({
      fs: mockDeep(),
      http: mockDeep(),
      pdf: mockDeep(),
      ffmpeg: mockDeep(),
      puppeteer: mockDeep(),
      imgProc: mockDeep(),
      s3: mockDeep(),
      queue: mockDeep(),
      db: mockDeep(),
    }),
    mocks,
  };
  const addJob = vi.fn().mockImplementationOnce(() => fp.TE.right(undefined));

  beforeEach(() => {
    mockClear(Test.ctx.db);
    mockClear(Test.ctx.s3);

    mockTERightOnce(Test.ctx.db.save, (_, m) => m);
  });

  test.todo("Should create a media from PDF location");

  test("Should create a media from image location", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 1)
      .map(({ createdAt, updatedAt, id, thumbnail, ...m }, i) => ({
        ...m,
        id,
        label: `label-${id}`,
        location: `https://example.com/${id}.jpg` as URL,
        type: ImageType.members[0].literals[0],
        creator: undefined,
      }));

    const mediaUploadLocation = tests.fc.sample(tests.fc.webUrl(), 1)[0];
    mockTERightOnce(Test.ctx.s3.upload, () => ({
      Location: mediaUploadLocation,
    }));

    const response = await pipe(
      createAndUpload(
        {
          ...media,
          location: media.location,
          thumbnail: undefined,
        },
        { Body: "image", ContentType: ImageType.members[0].literals[0] },
        media.id,
        false,
      )(Test.ctx),
      throwTE,
    );

    expect(response).toMatchObject({
      location: mediaUploadLocation,
    });
  });

  test("Should create a media from MP4 file location", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 1)
      .map(({ createdAt, updatedAt, deletedAt, id, thumbnail, ...m }, i) => ({
        ...m,
        id,
        label: `label-${id}`,
        location: `https://example.com/${id}.mp4` as URL,
        type: MP4Type.literals[0],
        creator: undefined,
        extra: undefined,
      }));

    const mediaUploadLocation = tests.fc.sample(tests.fc.webUrl(), 1)[0];
    mockTERightOnce(Test.ctx.s3.upload, () => ({
      Location: mediaUploadLocation,
    }));

    const result = await pipe(
      createAndUpload(
        {
          ...media,
          location: media.location,
          thumbnail: undefined,
        },
        { Body: {}, ContentType: MP4Type.literals[0] },
        media.id,
        false,
      )(Test.ctx),
      throwTE,
    );

    expect(addJob).not.toHaveBeenCalled();

    expect(result).toMatchObject({
      ...media,
      id: expect.any(String),
      description: media.description ?? media.label,
      creator: undefined,
      location: mediaUploadLocation,
      // extra: {
      //   width: 0,
      //   height: expect.any(Number),
      //   thumbnailWidth: 0,
      //   thumbnailHeight: 0,
      //   thumbnails: [],
      //   needRegenerateThumbnail: false,
      // },
      extra: undefined,
      // socialPosts: [],
      // transferable: true,
      // createdAt: expect.any(String),
      // updatedAt: expect.any(String),
    });
  });

  test("Should create a media from iframe/video location", async () => {
    const [media] = tests.fc
      .sample(MediaArb, 1)
      .map(({ createdAt, updatedAt, deletedAt, thumbnail, id, ...m }, i) => ({
        ...m,
        id,
        label: `label-${id}`,
        location: `https://www.youtube.com/watch?v=${id}` as URL,
        type: IframeVideoType.literals[0],
        creator: undefined,
      }));

    const response = await pipe(
      createAndUpload(
        {
          ...media,
          location: media.location,
          thumbnail: undefined,
        },
        { Body: {}, ContentType: IframeVideoType.literals[0] },
        media.id,
        false,
      )(Test.ctx),
      throwTE,
    );

    expect(Test.ctx.s3.upload).toHaveBeenCalledTimes(0);
    expect(Test.ctx.db.save).toHaveBeenCalledTimes(1);

    expect(response).toMatchObject({
      ...media,
      id: expect.any(String),
      // location: `https://www.youtube.com/embed/${media.id}`,
      location: `https://www.youtube.com/watch?v=${media.id}` as URL,
      description: media.description ?? media.label,
      creator: undefined,
      // extra: {
      //   width: 0,
      //   height: 0,
      //   thumbnailWidth: 0,
      //   thumbnailHeight: 0,
      //   thumbnails: [],
      //   needRegenerateThumbnail: false,
      // },
      // socialPosts: [],
      // transferable: true,
      // createdAt: expect.any(String),
      // updatedAt: expect.any(String),
    });
  });

  test("Should get an error when 'location' in media is duplicated", async () => {
    const [media] = tests.fc
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
        location: `https://example.com/${id}.jpg` as URL,
        thumbnail: `https://example.com/${id}-thumb.jpg` as URL,
        creator: undefined,
        extra: undefined,
      }));

    Test.ctx.db.findOneOrFail.mockResolvedValueOnce(media as any);

    Test.mocks.axios.get.mockImplementation(() => {
      return Promise.resolve({ data: Buffer.from([]) });
    });

    Test.mocks.redis.publish.mockResolvedValueOnce(1);

    const task = pipe(
      createAndUpload(
        {
          ...media,
          location: media.location,
          thumbnail: undefined,
        },
        { Body: {}, ContentType: IframeVideoType.literals[0] },
        media.id,
        true,
      )(Test.ctx),
    );

    await expect(throwTE(task)).rejects.toThrowError();

    expect(sharpMock.toFormat).not.toHaveBeenCalled();
    expect(sharpMock.toBuffer).not.toHaveBeenCalled();
  });
});
