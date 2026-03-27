import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { extractThumbnailFromImage } from "./extractThumbnailFromImage.flow.js";

const createMockContext = () => {
  const http = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  return { http };
};

describe("extractThumbnailFromImage", () => {
  let ctx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it("should return array buffer from image URL", async () => {
    const imageData = new ArrayBuffer(1024);
    const media = {
      id: "123" as any,
      location: "https://example.com/image.jpg",
      type: "image/jpeg" as const,
    };

    ctx.http.get = vi.fn().mockReturnValue(TE.right(imageData));

    const result = await pipe(
      extractThumbnailFromImage(media)(ctx as any),
      throwTE,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(ArrayBuffer);
    expect(ctx.http.get).toHaveBeenCalledWith(
      "https://example.com/image.jpg",
      expect.objectContaining({ responseType: "arraybuffer" }),
    );
  });

  it("should convert buffer to Uint8Array", async () => {
    const originalBuffer = new ArrayBuffer(512);
    const view = new Uint8Array(originalBuffer);
    for (let i = 0; i < 512; i++) {
      view[i] = i % 256;
    }

    const media = {
      id: "456" as any,
      location: "https://example.com/photo.png",
      type: "image/png" as const,
    };

    ctx.http.get = vi.fn().mockReturnValue(TE.right(originalBuffer));

    const result = await pipe(
      extractThumbnailFromImage(media)(ctx as any),
      throwTE,
    );

    const resultArray = new Uint8Array(result[0]);
    expect(resultArray[0]).toBe(0);
    expect(resultArray[1]).toBe(1);
  });

  it("should return Left when HTTP request fails", async () => {
    const media = {
      id: "789" as any,
      location: "https://example.com/missing.jpg",
      type: "image/jpeg" as const,
    };

    ctx.http.get = vi.fn().mockReturnValue(
      TE.left({
        name: "HTTPError",
        message: "Not Found",
        status: 404,
      }),
    );

    const result = await extractThumbnailFromImage(media)(ctx as any)();

    expect(result._tag).toBe("Left");
  });

  it("should handle different image types", async () => {
    const imageData = new ArrayBuffer(256);
    const media = {
      id: "abc" as any,
      location: "https://example.com/image.webp",
      type: "image/webp" as const,
    };

    ctx.http.get = vi.fn().mockReturnValue(TE.right(imageData));

    const result = await pipe(
      extractThumbnailFromImage(media)(ctx as any),
      throwTE,
    );

    expect(result).toHaveLength(1);
    expect(ctx.http.get).toHaveBeenCalledWith(
      "https://example.com/image.webp",
      expect.any(Object),
    );
  });
});
