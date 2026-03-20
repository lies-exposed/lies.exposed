import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resizeThumbnailFlow } from "./thumbnailResize.flow.js";

const createMockContext = () => {
  const config = {
    dirs: {
      cwd: "",
      config: { nlp: "" },
      temp: { root: "", nlp: "", media: "", queue: "", stats: "" },
    },
    media: {
      thumbnailWidth: 200,
      thumbnailHeight: 200,
    },
    events: {},
  };

  const mockSharpFn = vi.fn();
  const mockSharp = vi.fn().mockReturnValue({
    keepExif: vi.fn().mockReturnThis(),
    rotate: vi.fn().mockReturnThis(),
    resize: vi.fn().mockReturnThis(),
    toFormat: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("resized")),
  });

  const imgProc = {
    run: vi.fn().mockImplementation((fn: (s: any) => Promise<Buffer>) => {
      return TE.right(Buffer.from("resized"));
    }),
    readExif: vi.fn(),
  };

  return {
    config,
    imgProc,
  };
};

describe("resizeThumbnailFlow", () => {
  let ctx: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it("should return a resized buffer", async () => {
    const inputBuffer = new ArrayBuffer(1024);

    const result = await pipe(
      resizeThumbnailFlow(inputBuffer)(ctx as any),
      throwTE,
    );

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe("resized");
  });

  it("should call imgProc.run with a function", async () => {
    const inputBuffer = new ArrayBuffer(512);

    await pipe(
      resizeThumbnailFlow(inputBuffer)(ctx as any),
      throwTE,
    );

    expect(ctx.imgProc.run).toHaveBeenCalled();
  });

  it("should handle errors from imgProc.run", async () => {
    const ctxWithError = {
      ...ctx,
      imgProc: {
        ...ctx.imgProc,
        run: vi.fn().mockReturnValue(
          TE.left({
            name: "ImgProcError",
            status: 500,
            message: "Sharp error",
            details: { kind: "ServerError" as const, status: "500" },
          }),
        ),
      },
    };

    const inputBuffer = new ArrayBuffer(256);

    const result = await resizeThumbnailFlow(inputBuffer)(ctxWithError as any)();

    expect(result._tag).toBe("Left");
  });
});
