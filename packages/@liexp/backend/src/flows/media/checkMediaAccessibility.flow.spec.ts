import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
    const url = "https://example.com/image.jpg" as any;
    mockTERightOnce(mockHttp.get, () => ({ data: "stream" }));

    const result = await pipe(checkMediaAccessibility(url)(ctx), throwTE);

    expect(result.accessible).toBe(true);
    expect(result.method).toBe("http");
    expect(result.error).toBeUndefined();
  });

  it("should call http.get with browser-like headers", async () => {
    const url = "https://example.com/photo.png" as any;
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
    const url = "https://example.com/missing.jpg" as any;
    const httpError = {
      name: "HTTPError",
      message: "Not Found",
      status: 404,
    } as any;

    mockHttp.get.mockImplementationOnce(() => TE.left(httpError));

    const result = await checkMediaAccessibility(url)(ctx)();

    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(result.left.name).toBe("HTTPError");
    }
  });

  it("should extract origin correctly from URL for Referer header", async () => {
    const url = "https://cdn.example.org/path/to/image.webp" as any;
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
});
