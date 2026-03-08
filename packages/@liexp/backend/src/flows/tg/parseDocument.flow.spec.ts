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

vi.mock("../media/uploadAndCreate.flow.js", () => ({
  uploadAndCreate: vi.fn(),
}));

import { uploadAndCreate } from "../media/uploadAndCreate.flow.js";
import { parseDocument } from "./parseDocument.flow.js";

type ParseDocumentContext = TGBotProviderContext &
  LoggerContext &
  SpaceContext &
  ENVContext &
  QueuesProviderContext &
  DatabaseContext &
  ConfigContext &
  FSClientContext &
  HTTPProviderContext &
  RedisContext;

describe(parseDocument.name, () => {
  const appTest = {
    ctx: mockedContext<ParseDocumentContext>({
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

  it("should return UUID array when document is a PDF", async () => {
    const doc = {
      file_id: "doc-file-id",
      file_unique_id: "doc-unique-id",
      file_name: "test.pdf",
      mime_type: "application/pdf",
    } as any;

    const fakeMedia = { id: "some-media-id" } as MediaEntity;

    appTest.ctx.tg.getFileStream.mockReturnValueOnce(
      fp.TE.right(mockStream),
    );

    vi.mocked(uploadAndCreate).mockReturnValue(() =>
      fp.TE.right(fakeMedia),
    );

    const result = await pipe(parseDocument(doc)(appTest.ctx), throwTE);

    expect(result).toHaveLength(1);
    expect(typeof result[0]).toBe("string");
    expect(appTest.ctx.tg.getFileStream).toHaveBeenCalledWith(doc);
    expect(uploadAndCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "application/pdf",
        label: "test.pdf",
        description: "test.pdf",
      }),
      expect.objectContaining({
        Body: mockStream,
        ContentType: "application/pdf",
      }),
      expect.any(String),
      false,
    );
  });

  it("should return Left when document mime_type is not PDF", async () => {
    const doc = {
      file_id: "doc-file-id",
      file_unique_id: "doc-unique-id",
      file_name: "video.mp4",
      mime_type: "video/mp4",
    } as any;

    appTest.ctx.tg.getFileStream.mockReturnValueOnce(
      fp.TE.right(mockStream),
    );

    const te = parseDocument(doc)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
    expect(uploadAndCreate).not.toHaveBeenCalled();
  });

  it("should return Left when getFileStream fails", async () => {
    const doc = {
      file_id: "doc-file-id",
      file_unique_id: "doc-unique-id",
      file_name: "test.pdf",
      mime_type: "application/pdf",
    } as any;

    const streamError = new Error("Stream error");
    appTest.ctx.tg.getFileStream.mockReturnValueOnce(
      fp.TE.left(streamError),
    );

    const te = parseDocument(doc)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
    expect(uploadAndCreate).not.toHaveBeenCalled();
  });

  it("should return Left when uploadAndCreate fails", async () => {
    const doc = {
      file_id: "doc-file-id",
      file_unique_id: "doc-unique-id",
      file_name: "test.pdf",
      mime_type: "application/pdf",
    } as any;

    appTest.ctx.tg.getFileStream.mockReturnValueOnce(
      fp.TE.right(mockStream),
    );

    vi.mocked(uploadAndCreate).mockReturnValue(() =>
      fp.TE.left({ name: "ServerError", message: "upload failed" } as any),
    );

    const te = parseDocument(doc)(appTest.ctx);
    const outcome = await te();

    expect(outcome._tag).toBe("Left");
  });

  it("should use PDFType default when mime_type is undefined", async () => {
    const doc = {
      file_id: "doc-file-id",
      file_unique_id: "doc-unique-id",
      file_name: "document",
      mime_type: "application/pdf",
    } as any;

    const fakeMedia = { id: "some-media-id" } as MediaEntity;

    appTest.ctx.tg.getFileStream.mockReturnValueOnce(
      fp.TE.right(mockStream),
    );

    vi.mocked(uploadAndCreate).mockReturnValue(() =>
      fp.TE.right(fakeMedia),
    );

    const result = await pipe(parseDocument(doc)(appTest.ctx), throwTE);

    expect(result).toHaveLength(1);
  });
});
