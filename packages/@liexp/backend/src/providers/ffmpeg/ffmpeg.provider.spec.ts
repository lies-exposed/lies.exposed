import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import type ffmpeg from "fluent-ffmpeg";
import { pipe } from "fp-ts/lib/function.js";
import { describe, test, beforeEach, expect } from "vitest";
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
    ffmpegMock.ffprobe.mockImplementation((file, cb: any) => {
      cb(null, {});
    });
    await pipe(ffmpegProvider.ffprobe("file"), throwTE);
    expect(ffmpegMock.ffprobe).toHaveBeenCalled();
  });
});
