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
import { parsePhoto } from "./parsePhoto.flow.js";

vi.mock("../media/uploadAndCreate.flow.js", () => ({
  uploadAndCreate: vi.fn(),
}));

type ParsePhotoContext = TGBotProviderContext &
  LoggerContext &
  SpaceContext &
  ENVContext &
  QueuesProviderContext &
  DatabaseContext &
  ConfigContext &
  FSClientContext &
  HTTPProviderContext &
  RedisContext;

describe(parsePhoto.name, () => {
  const appTest = {
    ctx: mockedContext<ParsePhotoContext>({
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array when photo array is empty", async () => {
    const result = await pipe(
      parsePhoto("description", [])(appTest.ctx),
      throwTE,
    );

    expect(result).toEqual([]);
    expect(appTest.ctx.tg.getFileStream).not.toHaveBeenCalled();
  });

  it("should parse a single photo and return UUID array", async () => {
    const photo = [
      {
        file_id: "photo-file-id",
        file_unique_id: "photo-unique-id",
        width: 320,
        height: 240,
      },
    ] as any[];

    const description = "Test photo";
    const fakeMedia = { id: "media-id" } as MediaEntity;

    appTest.ctx.tg.getFileStream.mockReturnValueOnce(fp.TE.right(mockStream));

    vi.mocked(uploadAndCreate).mockReturnValue(() => fp.TE.right(fakeMedia));

    const result = await pipe(
      parsePhoto(description, photo)(appTest.ctx),
      throwTE,
    );

    expect(result).toHaveLength(1);
    expect(typeof result[0]).toBe("string");
    expect(appTest.ctx.tg.getFileStream).toHaveBeenCalledWith(photo[0]);
    expect(uploadAndCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        location: "photo-file-id",
        label: description,
        description,
      }),
      expect.objectContaining({
        Body: mockStream,
      }),
      expect.any(String),
      false,
    );
  });

  it("should parse multiple photos and return UUID array with same length", async () => {
    const photos = [
      {
        file_id: "photo-file-id-1",
        file_unique_id: "photo-unique-id-1",
        width: 320,
        height: 240,
      },
      {
        file_id: "photo-file-id-2",
        file_unique_id: "photo-unique-id-2",
        width: 640,
        height: 480,
      },
    ] as any[];

    const description = "Multiple photos";
    const fakeMedia1 = { id: "media-id-1" } as MediaEntity;
    const fakeMedia2 = { id: "media-id-2" } as MediaEntity;

    appTest.ctx.tg.getFileStream
      .mockReturnValueOnce(fp.TE.right(mockStream))
      .mockReturnValueOnce(fp.TE.right(mockStream));

    vi.mocked(uploadAndCreate)
      .mockReturnValueOnce(() => fp.TE.right(fakeMedia1))
      .mockReturnValueOnce(() => fp.TE.right(fakeMedia2));

    const result = await pipe(
      parsePhoto(description, photos)(appTest.ctx),
      throwTE,
    );

    expect(result).toHaveLength(2);
    expect(appTest.ctx.tg.getFileStream).toHaveBeenCalledTimes(2);
    expect(uploadAndCreate).toHaveBeenCalledTimes(2);
  });

  it("should use correct media type (image/jpeg) in upload", async () => {
    const photo = [
      {
        file_id: "photo-file-id",
        file_unique_id: "photo-unique-id",
        width: 800,
        height: 600,
      },
    ] as any[];

    const fakeMedia = { id: "media-id" } as MediaEntity;

    appTest.ctx.tg.getFileStream.mockReturnValueOnce(fp.TE.right(mockStream));

    vi.mocked(uploadAndCreate).mockReturnValue(() => fp.TE.right(fakeMedia));

    await pipe(parsePhoto("desc", photo)(appTest.ctx), throwTE);

    expect(uploadAndCreate).toHaveBeenCalledWith(
      expect.objectContaining({ type: "image/jpg" }),
      expect.objectContaining({ ContentType: "image/jpg" }),
      expect.any(String),
      false,
    );
  });

  it("should return Left when getFileStream fails for any photo", async () => {
    const photos = [
      {
        file_id: "photo-file-id",
        file_unique_id: "photo-unique-id",
        width: 320,
        height: 240,
      },
    ] as any[];

    appTest.ctx.tg.getFileStream.mockReturnValueOnce(
      fp.TE.left(new Error("stream error")),
    );

    const te = parsePhoto("desc", photos)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
    expect(uploadAndCreate).not.toHaveBeenCalled();
  });

  it("should return Left when uploadAndCreate fails", async () => {
    const photos = [
      {
        file_id: "photo-file-id",
        file_unique_id: "photo-unique-id",
        width: 320,
        height: 240,
      },
    ] as any[];

    appTest.ctx.tg.getFileStream.mockReturnValueOnce(fp.TE.right(mockStream));

    vi.mocked(uploadAndCreate).mockReturnValue(() =>
      fp.TE.left({ name: "ServerError", message: "upload failed" } as any),
    );

    const te = parsePhoto("desc", photos)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
  });

  it("should process photos sequentially (ApplicativeSeq)", async () => {
    const photos = [
      {
        file_id: "photo-1",
        file_unique_id: "unique-1",
        width: 100,
        height: 100,
      },
      {
        file_id: "photo-2",
        file_unique_id: "unique-2",
        width: 200,
        height: 200,
      },
    ] as any[];

    const calls: string[] = [];

    appTest.ctx.tg.getFileStream.mockImplementation((p: any) => {
      calls.push(p.file_id);
      return fp.TE.right(mockStream);
    });

    vi.mocked(uploadAndCreate).mockReturnValue(() =>
      fp.TE.right({ id: "id" } as MediaEntity),
    );

    await pipe(parsePhoto("desc", photos)(appTest.ctx), throwTE);

    expect(calls).toEqual(["photo-1", "photo-2"]);
  });
});
