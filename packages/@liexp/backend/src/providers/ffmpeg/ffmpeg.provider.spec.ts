import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import type ffmpeg from "fluent-ffmpeg";
import { pipe } from "fp-ts/lib/function.js";
import { describe, test, beforeEach, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { GetFFMPEGProvider } from "./ffmpeg.provider.js";

describe("FFmpegProvider", () => {
  const ffmpegMock = mock<typeof ffmpeg>({} as any);
  let ffmpegProvider: ReturnType<typeof GetFFMPEGProvider>;
  beforeEach(() => {
    ffmpegProvider = GetFFMPEGProvider(ffmpegMock);
  });

  test("should be defined", () => {
    expect(ffmpegProvider).toBeDefined();
    expect(ffmpegProvider.ffprobe).toBeDefined();
    expect(ffmpegProvider.runCommand).toBeDefined();
  });

  test("should call ffprobe", async () => {
    ffmpegMock.ffprobe.mockImplementation((file: any, cb: any) => {
      cb(null, {});
    });
    await pipe(ffmpegProvider.ffprobe("file"), throwTE);
    expect(ffmpegMock.ffprobe).toHaveBeenCalled();
  });

  it("should handle ffprobe error", async () => {
    ffmpegMock.ffprobe.mockImplementation((file: any, cb: any) => {
      cb(new Error("File not found"), null);
    });
    const result = await ffmpegProvider.ffprobe("nonexistent")();
    expect(result._tag).toBe("Left");
  });

  it("should handle ffprobe with stream input", async () => {
    ffmpegMock.ffprobe.mockImplementation((file: any, cb: any) => {
      cb(null, { format: "mp4" });
    });
    const streamMock = {} as any;
    await pipe(ffmpegProvider.ffprobe(streamMock), throwTE);
    expect(ffmpegMock.ffprobe).toHaveBeenCalledWith(
      streamMock,
      expect.any(Function),
    );
  });
});
