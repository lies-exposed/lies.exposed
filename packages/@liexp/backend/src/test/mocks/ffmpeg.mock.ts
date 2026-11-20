import { type ScreenshotsConfig } from "fluent-ffmpeg";
import type Ffmpeg from "fluent-ffmpeg";
import { vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";

const SCREENSHOTS_DEFAULS = {
  folder: "",
  filename: "",
  count: 0,
} satisfies ScreenshotsConfig;

export const ffmpegCommandMock: MockProxy<Partial<typeof Ffmpeg>> & {
  _screenshots: ScreenshotsConfig;
} = mock({
  _screenshots: SCREENSHOTS_DEFAULS,
  on: vi.fn((): void => {
    throw new Error("on not implemented");
  }),
  inputFormat: vi.fn().mockReturnThis(),
  noAudio: vi.fn().mockReturnThis(),
  screenshots: vi.fn((opts?: number | ScreenshotsConfig) => {
    ffmpegCommandMock._screenshots =
      typeof opts === "number"
        ? { ...SCREENSHOTS_DEFAULS, count: opts }
        : (opts ?? SCREENSHOTS_DEFAULS);
    return ffmpegCommandMock;
  }),
});

export const ffmpegMock = Object.assign(
  vi.fn(() => ffmpegCommandMock),
  {
    ffprobe: vi.fn((): void => {
      throw new Error("ffprobe not implemented");
    }),
  },
);

export default ffmpegMock;
