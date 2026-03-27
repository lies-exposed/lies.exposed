import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { extractThumbnail } from "./extractThumbnail.flow.js";

vi.mock("./extractThumbnailFromImage.flow.js", () => ({
  extractThumbnailFromImage: vi.fn(),
}));
vi.mock("./extractThumbnailFromPDF.flow.js", () => ({
  extractThumbnailFromPDF: vi.fn(),
}));
vi.mock("./extractMP4Thumbnail.flow.js", () => ({
  extractMP4Thumbnail: vi.fn(),
}));
vi.mock("./extractThumbnailFromVideoPlatform.flow.js", () => ({
  extractThumbnailFromIframe: vi.fn(),
}));
vi.mock("./thumbnailResize.flow.js", () => ({
  resizeThumbnailFlow: vi.fn(),
}));

import { extractThumbnailFromImage } from "./extractThumbnailFromImage.flow.js";
import { extractThumbnailFromPDF } from "./extractThumbnailFromPDF.flow.js";
import { extractMP4Thumbnail } from "./extractMP4Thumbnail.flow.js";
import { extractThumbnailFromIframe } from "./extractThumbnailFromVideoPlatform.flow.js";
import { resizeThumbnailFlow } from "./thumbnailResize.flow.js";

const TEST_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890" as any;
const TEST_URL = "https://example.com/media" as any;
const MOCK_BUFFER = new ArrayBuffer(128);
const MOCK_RESIZED = new Uint8Array(64).buffer;

const createMockContext = () => ({
  logger: {
    info: { log: vi.fn() },
    debug: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
    extend: vi.fn().mockReturnThis(),
  },
  env: { SPACE_BUCKET: "test-bucket" },
  config: { dirs: { temp: { media: "/tmp" } } },
  http: { get: vi.fn() },
  db: { findOneOrFail: vi.fn(), save: vi.fn() },
  fs: {},
  pdf: {},
  ffmpeg: {},
  puppeteer: {},
  imgproc: {},
});

describe("extractThumbnail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resizeThumbnailFlow).mockReturnValue(
      fp.RTE.right(MOCK_RESIZED),
    );
  });

  it("dispatches to extractThumbnailFromImage for image/jpeg", async () => {
    vi.mocked(extractThumbnailFromImage).mockReturnValue(
      fp.RTE.right([MOCK_BUFFER]),
    );

    const media = {
      id: TEST_UUID,
      location: TEST_URL,
      type: "image/jpeg" as const,
    };

    const ctx = createMockContext();
    const result = await pipe(
      extractThumbnail(media)(ctx as any),
      throwTE,
    );

    expect(extractThumbnailFromImage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "image/jpeg" }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].Bucket).toBe("test-bucket");
    expect(result[0].ACL).toBe("public-read");
  });

  it("dispatches to extractThumbnailFromImage for image/png", async () => {
    vi.mocked(extractThumbnailFromImage).mockReturnValue(
      fp.RTE.right([MOCK_BUFFER]),
    );

    const media = {
      id: TEST_UUID,
      location: TEST_URL,
      type: "image/png" as const,
    };

    const ctx = createMockContext();
    await pipe(extractThumbnail(media)(ctx as any), throwTE);

    expect(extractThumbnailFromImage).toHaveBeenCalled();
    expect(extractThumbnailFromPDF).not.toHaveBeenCalled();
    expect(extractMP4Thumbnail).not.toHaveBeenCalled();
  });

  it("dispatches to extractThumbnailFromPDF for application/pdf", async () => {
    vi.mocked(extractThumbnailFromPDF).mockReturnValue(
      fp.RTE.right([MOCK_BUFFER]),
    );

    const media = {
      id: TEST_UUID,
      location: TEST_URL,
      type: "application/pdf" as const,
    };

    const ctx = createMockContext();
    await pipe(extractThumbnail(media)(ctx as any), throwTE);

    expect(extractThumbnailFromPDF).toHaveBeenCalledWith(
      expect.objectContaining({ type: "application/pdf" }),
    );
    expect(extractThumbnailFromImage).not.toHaveBeenCalled();
  });

  it("dispatches to extractMP4Thumbnail for video/mp4", async () => {
    vi.mocked(extractMP4Thumbnail).mockReturnValue(
      fp.RTE.right([MOCK_BUFFER]),
    );

    const media = {
      id: TEST_UUID,
      location: TEST_URL,
      type: "video/mp4" as const,
    };

    const ctx = createMockContext();
    await pipe(extractThumbnail(media)(ctx as any), throwTE);

    expect(extractMP4Thumbnail).toHaveBeenCalledWith(
      expect.objectContaining({ type: "video/mp4" }),
    );
    expect(extractThumbnailFromImage).not.toHaveBeenCalled();
  });

  it("returns empty thumbnails for audio/mp3 without calling extractors", async () => {
    const media = {
      id: TEST_UUID,
      location: TEST_URL,
      type: "audio/mp3" as const,
    };

    const ctx = createMockContext();
    const result = await pipe(extractThumbnail(media)(ctx as any), throwTE);

    expect(extractThumbnailFromImage).not.toHaveBeenCalled();
    expect(extractThumbnailFromPDF).not.toHaveBeenCalled();
    expect(extractMP4Thumbnail).not.toHaveBeenCalled();
    expect(extractThumbnailFromIframe).not.toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });

  it("returns empty thumbnails for audio/ogg without calling extractors", async () => {
    const media = {
      id: TEST_UUID,
      location: TEST_URL,
      type: "audio/ogg" as const,
    };

    const ctx = createMockContext();
    const result = await pipe(extractThumbnail(media)(ctx as any), throwTE);

    expect(extractThumbnailFromImage).not.toHaveBeenCalled();
    expect(result).toHaveLength(0);
  });

  it("dispatches to extractThumbnailFromIframe for iframe/video", async () => {
    vi.mocked(extractThumbnailFromIframe).mockReturnValue(
      fp.RTE.right([MOCK_BUFFER]),
    );

    const media = {
      id: TEST_UUID,
      location: TEST_URL,
      type: "iframe/video" as const,
    };

    const ctx = createMockContext();
    await pipe(extractThumbnail(media)(ctx as any), throwTE);

    expect(extractThumbnailFromIframe).toHaveBeenCalledWith(
      expect.objectContaining({ type: "iframe/video" }),
    );
    expect(extractThumbnailFromImage).not.toHaveBeenCalled();
  });

  it("applies resize to all extracted thumbnails", async () => {
    const buffer1 = new ArrayBuffer(64);
    const buffer2 = new ArrayBuffer(128);
    vi.mocked(extractThumbnailFromImage).mockReturnValue(
      fp.RTE.right([buffer1, buffer2]),
    );

    const resized1 = new Uint8Array(32).buffer;
    const resized2 = new Uint8Array(48).buffer;
    vi.mocked(resizeThumbnailFlow)
      .mockReturnValueOnce(fp.RTE.right(resized1))
      .mockReturnValueOnce(fp.RTE.right(resized2));

    const media = {
      id: TEST_UUID,
      location: TEST_URL,
      type: "image/jpeg" as const,
    };

    const ctx = createMockContext();
    const result = await pipe(extractThumbnail(media)(ctx as any), throwTE);

    expect(resizeThumbnailFlow).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
  });

  it("returns Left when extraction fails", async () => {
    vi.mocked(extractThumbnailFromImage).mockReturnValue(
      fp.RTE.left({
        name: "ServerError",
        message: "HTTP fetch failed",
        status: 500,
      } as any),
    );

    const media = {
      id: TEST_UUID,
      location: TEST_URL,
      type: "image/jpeg" as const,
    };

    const ctx = createMockContext();
    const result = await extractThumbnail(media)(ctx as any)();

    expect(result._tag).toBe("Left");
  });

  it("includes correct S3 key in output", async () => {
    vi.mocked(extractThumbnailFromImage).mockReturnValue(
      fp.RTE.right([MOCK_BUFFER]),
    );

    const media = {
      id: TEST_UUID,
      location: TEST_URL,
      type: "image/png" as const,
    };

    const ctx = createMockContext();
    const result = await pipe(extractThumbnail(media)(ctx as any), throwTE);

    expect(result[0].Key).toContain(TEST_UUID);
  });
});
