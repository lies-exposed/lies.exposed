import { pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/io/lib/http/Common/URL.js";
import { HTTPError } from "@liexp/shared/lib/providers/http/http.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import { checkMediaAccessibility } from "./checkMediaAccessibility.flow.js";

type CheckMediaContext = HTTPProviderContext & LoggerContext;

describe(checkMediaAccessibility.name, () => {
  const mockHttp = mockDeep<HTTPProviderContext["http"]>();

  const ctx = mockedContext<CheckMediaContext>({ http: mockHttp });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return accessible=true when HTTP GET succeeds", async () => {
    const url = "https://example.com/image.jpg" as string;
    mockTERightOnce(mockHttp.get, () => ({ data: "stream" }));

    const result = await pipe(checkMediaAccessibility(url)(ctx), throwTE);

    expect(result.accessible).toBe(true);
    expect(result.method).toBe("http");
    expect(result.error).toBeUndefined();
  });

  it("should call http.get with browser-like headers", async () => {
    const url = "https://example.com/photo.png" as string;
    mockTERightOnce(mockHttp.get, () => ({}));

    await pipe(checkMediaAccessibility(url)(ctx), throwTE);

    expect(mockHttp.get).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        responseType: "stream",
        headers: expect.objectContaining({
          "User-Agent": expect.stringContaining("Mozilla"),
          Referer: "https://example.com",
        }),
      }),
    );
  });

  it("should return Left with HTTPError when HTTP GET fails", async () => {
    const url = "https://example.com/missing.jpg" as string;
    const httpError = {
      name: "HTTPError",
      message: "Not Found",
      status: 404,
    } as Error;

    mockHttp.get.mockImplementationOnce(() => TE.left(httpError));

    const result = await checkMediaAccessibility(url)(ctx)();

    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(result.left.name).toBe("HTTPError");
    }
  });

  it("should extract origin correctly from URL for Referer header", async () => {
    const url = "https://cdn.example.org/path/to/image.webp" as string;
    mockTERightOnce(mockHttp.get, () => ({}));

    await pipe(checkMediaAccessibility(url)(ctx), throwTE);

    expect(mockHttp.get).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        headers: expect.objectContaining({
          Referer: "https://cdn.example.org",
        }),
      }),
    );
  });

  it("should request only the first byte and destroy the stream", async () => {
    const url = "https://example.com/big.mp4" as URL;
    const destroy = vi.fn();
    mockTERightOnce(mockHttp.get, () => ({ destroy }));

    await pipe(checkMediaAccessibility(url)(ctx), throwTE);

    expect(mockHttp.get).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        headers: expect.objectContaining({ Range: "bytes=0-0" }),
      }),
    );
    expect(destroy).toHaveBeenCalledOnce();
  });

  describe("429 handling", () => {
    const httpError = (status: number) =>
      new HTTPError(`${status}`, {
        kind: "ClientError",
        status: `${status}`,
        meta: [],
      });
    const rateLimited = httpError(429);

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should retry with backoff and succeed", async () => {
      const url = "https://upload.example.org/a.jpg" as URL;
      mockHttp.get
        .mockImplementationOnce(() => TE.left(rateLimited))
        .mockImplementationOnce(() => TE.right({}));

      const promise = checkMediaAccessibility(url)(ctx)();
      await vi.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result._tag).toBe("Right");
      expect(mockHttp.get).toHaveBeenCalledTimes(2);
    });

    it("should give up after max attempts and keep the 429 status", async () => {
      const url = "https://upload.example.org/b.jpg" as URL;
      mockHttp.get.mockImplementation(() => TE.left(rateLimited));

      const promise = checkMediaAccessibility(url)(ctx)();
      await vi.advanceTimersByTimeAsync(1000 + 2000);
      const result = await promise;

      expect(mockHttp.get).toHaveBeenCalledTimes(3);
      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left.status).toBe(429);
      }
      mockHttp.get.mockReset();
    });

    it("should not retry non-429 errors", async () => {
      const url = "https://example.com/gone.jpg" as URL;
      mockHttp.get.mockImplementationOnce(() => TE.left(httpError(404)));

      const result = await checkMediaAccessibility(url)(ctx)();

      expect(mockHttp.get).toHaveBeenCalledTimes(1);
      expect(result._tag === "Left" && result.left.status).toBe(404);
    });
  });
});
