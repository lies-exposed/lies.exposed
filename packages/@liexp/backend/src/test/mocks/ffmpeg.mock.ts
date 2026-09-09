import type Ffmpeg from "fluent-ffmpeg";
import { type Mock, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";

const SCREENSHOTS_DEFAULS = {
  folder: "",
  filename: "",
  count: 0,
};

export const ffmpegCommandMock: MockProxy<Partial<typeof Ffmpeg>> & {
  _screenshots: typeof SCREENSHOTS_DEFAULS;
} = mock({
  _screenshots: SCREENSHOTS_DEFAULS,
  on: vi.fn((): void => {
    throw new Error("on not implemented");
  }),
  inputFormat: vi.fn().mockReturnThis(),
  noAudio: vi.fn().mockReturnThis(),
  screenshots: vi.fn().mockImplementation(function (this: any, opts) {
    this._screenshots = opts;
    return this;
  }),
});

const ffmpegMock: Mock<() => typeof ffmpegCommandMock> = vi.fn(
  () => ffmpegCommandMock,
);
(ffmpegMock as any).ffprobe = vi.fn(() => {
  throw new Error("ffprobe not implemented");
});

export default ffmpegMock;
