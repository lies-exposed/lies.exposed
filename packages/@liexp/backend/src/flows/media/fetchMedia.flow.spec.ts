import { Readable } from "stream";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/io/lib/http/Common/URL.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { mockedContext } from "../../test/context.js";
import { fetchMedia } from "./fetchMedia.flow.js";

type FetchMediaContext = HTTPProviderContext;

describe(fetchMedia.name, () => {
  const appTest = {
    ctx: mockedContext<FetchMediaContext>({
      http: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch media as a readable stream", async () => {
    const mediaUrl = "https://example.com/media/image.jpg" as URL;
    const mockStream = Readable.from(["chunk1", "chunk2"]);

    appTest.ctx.http.get.mockReturnValueOnce(fp.TE.right(mockStream));

    const result = await pipe(fetchMedia(mediaUrl)(appTest.ctx), throwTE);

    expect(appTest.ctx.http.get).toHaveBeenCalledWith(mediaUrl, {
      responseType: "stream",
      headers: expect.objectContaining({
        "User-Agent": expect.any(String),
        Accept: expect.any(String),
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://example.com",
      }),
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: expect.any(Function),
    });

    expect(result).toBe(mockStream);
  });

  it("should extract origin from URL for Referer header", async () => {
    const mediaUrl = "https://cdn.example.org/path/to/file.png" as URL;
    const mockStream = Readable.from([]);

    appTest.ctx.http.get.mockReturnValueOnce(fp.TE.right(mockStream));

    await pipe(fetchMedia(mediaUrl)(appTest.ctx), throwTE);

    expect(appTest.ctx.http.get).toHaveBeenCalledWith(
      mediaUrl,
      expect.objectContaining({
        headers: expect.objectContaining({
          Referer: "https://cdn.example.org",
        }),
      }),
    );
  });

  it("should include browser-like User-Agent header", async () => {
    const mediaUrl = "https://protected-site.com/image.webp" as URL;
    const mockStream = Readable.from([]);

    appTest.ctx.http.get.mockReturnValueOnce(fp.TE.right(mockStream));

    await pipe(fetchMedia(mediaUrl)(appTest.ctx), throwTE);

    expect(appTest.ctx.http.get).toHaveBeenCalledWith(
      mediaUrl,
      expect.objectContaining({
        headers: expect.objectContaining({
          "User-Agent": expect.stringContaining("Mozilla"),
        }),
      }),
    );
  });

  it("should accept various image content types", async () => {
    const mediaUrl = "https://example.com/photo.avif" as URL;
    const mockStream = Readable.from([]);

    appTest.ctx.http.get.mockReturnValueOnce(fp.TE.right(mockStream));

    await pipe(fetchMedia(mediaUrl)(appTest.ctx), throwTE);

    expect(appTest.ctx.http.get).toHaveBeenCalledWith(
      mediaUrl,
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: expect.stringContaining("image/avif"),
        }),
      }),
    );
  });

  it("should use custom validateStatus function for 2xx responses", async () => {
    const mediaUrl = "https://example.com/video.mp4" as URL;
    const mockStream = Readable.from([]);

    appTest.ctx.http.get.mockReturnValueOnce(fp.TE.right(mockStream));

    await pipe(fetchMedia(mediaUrl)(appTest.ctx), throwTE);

    const callArgs = appTest.ctx.http.get.mock.calls[0];
    const validateStatus = callArgs[1]?.validateStatus as (
      status: number,
    ) => boolean;

    expect(validateStatus(200)).toBe(true);
    expect(validateStatus(201)).toBe(true);
    expect(validateStatus(299)).toBe(true);
    expect(validateStatus(300)).toBe(false);
    expect(validateStatus(404)).toBe(false);
    expect(validateStatus(500)).toBe(false);
  });
});
