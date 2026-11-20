import { type Stream } from "stream";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import type ffmpeg from "fluent-ffmpeg";
import { pipe } from "fp-ts/lib/function.js";
import { describe, test, beforeEach, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { GetFFMPEGProvider } from "./ffmpeg.provider.js";

type FfprobeCallback = (
  err: Error | null,
  data: ffmpeg.FfprobeData | null,
) => void;

const ffprobeMock =
  vi.fn<(file: string | Stream, callback: FfprobeCallback) => void>();

const probeData = (format: ffmpeg.FfprobeFormat): ffmpeg.FfprobeData => ({
  streams: [],
  chapters: [],
  format,
});

describe("FFmpegProvider", () => {
  const ffmpegMock = { ffprobe: ffprobeMock } as unknown as typeof ffmpeg;
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
    ffprobeMock.mockImplementation((_file, cb) => {
      cb(null, probeData({}));
    });
    await pipe(ffmpegProvider.ffprobe("file"), throwTE);
    expect(ffprobeMock).toHaveBeenCalled();
  });

  it("should handle ffprobe error", async () => {
    ffprobeMock.mockImplementation((_file, cb) => {
      cb(new Error("File not found"), null);
    });
    const result = await ffmpegProvider.ffprobe("nonexistent")();
    expect(result._tag).toBe("Left");
  });

  it("should handle ffprobe with stream input", async () => {
    ffprobeMock.mockImplementation((_file, cb) => {
      cb(null, probeData({ format_name: "mp4" }));
    });
    const streamMock = mock<Stream>();
    await pipe(ffmpegProvider.ffprobe(streamMock), throwTE);
    expect(ffprobeMock).toHaveBeenCalledWith(streamMock, expect.any(Function));
  });
});
