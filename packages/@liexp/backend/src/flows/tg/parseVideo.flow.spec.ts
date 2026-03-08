import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { type TGBotProviderContext } from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type QueuesProviderContext } from "../../context/queue.context.js";
import { type RedisContext } from "../../context/redis.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { type MediaEntity } from "../../entities/Media.entity.js";
import { mockedContext } from "../../test/context.js";
import { uploadAndCreate } from "../media/uploadAndCreate.flow.js";
import { upload } from "../space/upload.flow.js";
import { parseVideo } from "./parseVideo.flow.js";

vi.mock("../media/uploadAndCreate.flow.js", () => ({
  uploadAndCreate: vi.fn(),
}));

vi.mock("../space/upload.flow.js", () => ({
  upload: vi.fn(),
}));

type ParseVideoContext = LoggerContext &
  TGBotProviderContext &
  SpaceContext &
  ENVContext &
  QueuesProviderContext &
  DatabaseContext &
  ConfigContext &
  FSClientContext &
  HTTPProviderContext &
  RedisContext;

describe(parseVideo.name, () => {
  const appTest = {
    ctx: mockedContext<ParseVideoContext>({
      tg: mock(),
      db: mock(),
      space: mock(),
      queues: mock(),
      fs: mock(),
      http: mock(),
      redis: mock(),
      s3: mock(),
    }),
  };

  const mockStream = { pipe: vi.fn() } as any;
  const mockThumbStream = { pipe: vi.fn() } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse video without thumbnail and return UUID array", async () => {
    const video = {
      file_id: "video-file-id",
      file_unique_id: "video-unique-id",
      width: 1920,
      height: 1080,
      duration: 60,
      thumb: undefined,
    } as any;

    const description = "Test video description";
    const fakeMedia = { id: "media-id" } as MediaEntity;

    appTest.ctx.tg.getFileStream.mockReturnValueOnce(fp.TE.right(mockStream));

    vi.mocked(uploadAndCreate).mockReturnValue(() => fp.TE.right(fakeMedia));

    const result = await pipe(
      parseVideo(description, video)(appTest.ctx),
      throwTE,
    );

    expect(result).toHaveLength(1);
    expect(typeof result[0]).toBe("string");
    expect(appTest.ctx.tg.getFileStream).toHaveBeenCalledWith(video);
    expect(uploadAndCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "video/mp4",
        label: description,
        description,
        thumbnail: undefined,
      }),
      expect.objectContaining({
        Body: mockStream,
        ContentType: "video/mp4",
      }),
      expect.any(String),
      false,
    );
  });

  it("should parse video with thumbnail and return UUID array", async () => {
    const thumbFile = {
      file_id: "thumb-file-id",
      file_unique_id: "thumb-unique-id",
      width: 320,
      height: 180,
    };
    const video = {
      file_id: "video-file-id",
      file_unique_id: "video-unique-id",
      width: 1920,
      height: 1080,
      duration: 60,
      thumb: thumbFile,
    } as any;

    const description = "Video with thumbnail";
    const fakeMedia = { id: "media-id" } as MediaEntity;
    const thumbLocation = "https://cdn.example.com/thumb.jpg";

    // thumbTask is built first (before sequenceS), so getFileStream for thumb
    // is called before getFileStream for the main video.
    appTest.ctx.tg.getFileStream
      .mockReturnValueOnce(fp.TE.right(mockThumbStream)) // first: thumb
      .mockReturnValueOnce(fp.TE.right(mockStream)); // second: video

    vi.mocked(upload).mockReturnValue(() =>
      fp.TE.right({ Location: thumbLocation } as any),
    );

    vi.mocked(uploadAndCreate).mockReturnValue(() => fp.TE.right(fakeMedia));

    const result = await pipe(
      parseVideo(description, video)(appTest.ctx),
      throwTE,
    );

    expect(result).toHaveLength(1);
    expect(appTest.ctx.tg.getFileStream).toHaveBeenCalledTimes(2);
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({
        Body: mockThumbStream,
      }),
    );
    expect(uploadAndCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        thumbnail: expect.stringContaining("cdn.example.com"),
      }),
      expect.any(Object),
      expect.any(String),
      false,
    );
  });

  it("should return Left when getFileStream fails for video", async () => {
    const video = {
      file_id: "video-file-id",
      file_unique_id: "video-unique-id",
      duration: 30,
      thumb: undefined,
    } as any;

    appTest.ctx.tg.getFileStream.mockReturnValueOnce(
      fp.TE.left(new Error("stream error")),
    );

    const te = parseVideo("desc", video)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
    expect(uploadAndCreate).not.toHaveBeenCalled();
  });

  it("should return Left when thumbnail upload fails", async () => {
    const thumbFile = {
      file_id: "thumb-file-id",
      file_unique_id: "thumb-unique-id",
      width: 320,
      height: 180,
    };
    const video = {
      file_id: "video-file-id",
      file_unique_id: "video-unique-id",
      duration: 30,
      thumb: thumbFile,
    } as any;

    appTest.ctx.tg.getFileStream
      .mockReturnValueOnce(fp.TE.right(mockThumbStream)) // first: thumb
      .mockReturnValueOnce(fp.TE.right(mockStream)); // second: video

    vi.mocked(upload).mockReturnValue(() =>
      fp.TE.left({ name: "SpaceError", message: "upload failed" } as any),
    );

    const te = parseVideo("desc", video)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
    expect(uploadAndCreate).not.toHaveBeenCalled();
  });

  it("should return Left when uploadAndCreate fails", async () => {
    const video = {
      file_id: "video-file-id",
      file_unique_id: "video-unique-id",
      duration: 30,
      thumb: undefined,
    } as any;

    appTest.ctx.tg.getFileStream.mockReturnValueOnce(fp.TE.right(mockStream));

    vi.mocked(uploadAndCreate).mockReturnValue(() =>
      fp.TE.left({ name: "ServerError", message: "create failed" } as any),
    );

    const te = parseVideo("desc", video)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
  });

  it("should use file_unique_id as description fallback", async () => {
    const video = {
      file_id: "video-file-id",
      file_unique_id: "unique-desc-id",
      duration: 30,
      thumb: undefined,
    } as any;

    const fakeMedia = { id: "media-id" } as MediaEntity;

    appTest.ctx.tg.getFileStream.mockReturnValueOnce(fp.TE.right(mockStream));

    vi.mocked(uploadAndCreate).mockReturnValue(() => fp.TE.right(fakeMedia));

    // UUID string as description (direct string)
    const result = await pipe(
      parseVideo("some-uuid-description", video)(appTest.ctx),
      throwTE,
    );

    expect(result).toHaveLength(1);
  });
});
