import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { mockedContext } from "../../test/context.js";
import { fetchAsBuffer } from "./fetchAsBuffer.flow.js";

type FetchAsBufferContext = HTTPProviderContext;

describe(fetchAsBuffer.name, () => {
  const appTest = {
    ctx: mockedContext<FetchAsBufferContext>({
      http: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch URL content as ArrayBuffer", async () => {
    const url = "https://example.com/image.png";
    const mockBuffer = new ArrayBuffer(100);

    appTest.ctx.http.get.mockReturnValueOnce(fp.TE.right(mockBuffer));

    const result = await pipe(fetchAsBuffer(url)(appTest.ctx), throwTE);

    expect(appTest.ctx.http.get).toHaveBeenCalledWith(url, {
      responseType: "arraybuffer",
    });

    expect(result).toBe(mockBuffer);
    expect(result.byteLength).toBe(100);
  });

  it("should handle different URL formats", async () => {
    const urls = [
      "https://cdn.example.com/assets/logo.svg",
      "http://localhost:3000/api/file",
      "https://example.com/path/to/resource?query=param",
    ];

    for (const url of urls) {
      vi.clearAllMocks();
      const mockBuffer = new ArrayBuffer(50);

      appTest.ctx.http.get.mockReturnValueOnce(fp.TE.right(mockBuffer));

      const result = await pipe(fetchAsBuffer(url)(appTest.ctx), throwTE);

      expect(appTest.ctx.http.get).toHaveBeenCalledWith(url, {
        responseType: "arraybuffer",
      });

      expect(result).toBe(mockBuffer);
    }
  });

  it("should pass arraybuffer response type to http provider", async () => {
    const url = "https://example.com/binary-data";
    const mockBuffer = new ArrayBuffer(256);

    appTest.ctx.http.get.mockReturnValueOnce(fp.TE.right(mockBuffer));

    await pipe(fetchAsBuffer(url)(appTest.ctx), throwTE);

    expect(appTest.ctx.http.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        responseType: "arraybuffer",
      }),
    );
  });
});
