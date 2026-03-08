import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { type ConfigContext } from "../../../context/config.context.js";
import { type ENVContext } from "../../../context/env.context.js";
import { type FFMPEGProviderContext } from "../../../context/ffmpeg.context.js";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { type ImgProcClientContext } from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type SpaceContext } from "../../../context/space.context.js";
import { MediaEntity } from "../../../entities/Media.entity.js";
import { mockedContext } from "../../../test/context.js";

vi.mock("./extractImageTypeExtra.flow.js", () => ({
  extractImageTypeExtra: vi.fn(),
}));

vi.mock("./extractMP4Extra.js", () => ({
  extractMP4Extra: vi.fn(),
}));

vi.mock("./extractThumbnailsExtra.flow.js", () => ({
  extractThumbnailsExtra: vi.fn(),
}));

import { extractImageTypeExtra } from "./extractImageTypeExtra.flow.js";
import { extractMP4Extra } from "./extractMP4Extra.js";
import { extractThumbnailsExtra } from "./extractThumbnailsExtra.flow.js";
import { extractMediaExtra } from "./extractMediaExtra.flow.js";

type ExtractMediaContext = FFMPEGProviderContext &
  ConfigContext &
  HTTPProviderContext &
  ImgProcClientContext &
  LoggerContext &
  FSClientContext &
  SpaceContext &
  ENVContext;

describe("extractMediaExtra", () => {
  const mockFfmpeg = mockDeep<FFMPEGProviderContext["ffmpeg"]>();
  const mockHttp = mockDeep<HTTPProviderContext["http"]>();
  const mockImgProc = mockDeep<ImgProcClientContext["imgProc"]>();
  const mockSpace = mockDeep<SpaceContext["space"]>();
  const mockFs = mockDeep<FSClientContext["fs"]>();

  const ctx = mockedContext<ExtractMediaContext>({
    ffmpeg: mockFfmpeg,
    http: mockHttp,
    imgProc: mockImgProc,
    space: mockSpace,
    fs: mockFs,
  } as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call extractImageTypeExtra for image type media", async () => {
    const media = new MediaEntity();
    media.id = "media-img-1";
    media.type = "photo/jpeg" as any;
    media.location = "https://example.com/photo.jpg" as any;
    media.thumbnail = null;
    media.extra = null;

    const imageExtra = {
      width: 1920,
      height: 1080,
      thumbnailWidth: 0,
      thumbnailHeight: 0,
      thumbnails: [],
      needRegenerateThumbnail: true,
    };

    (extractImageTypeExtra as any).mockReturnValueOnce(
      fp.RTE.right(imageExtra),
    );

    (extractThumbnailsExtra as any).mockReturnValueOnce(
      fp.RTE.right({ thumbnailWidth: 0, thumbnailHeight: 0, thumbnails: [], needRegenerateThumbnail: true }),
    );

    const result = await pipe(extractMediaExtra(media)(ctx), throwTE);

    expect(extractImageTypeExtra).toHaveBeenCalledWith(media);
    expect(result).toBeDefined();
    expect((result as any).width).toBe(1920);
  });

  it("should call extractMP4Extra for mp4 type media", async () => {
    const media = new MediaEntity();
    media.id = "media-mp4-1";
    media.type = "video/mp4" as any;
    media.location = "https://example.com/video.mp4" as any;
    media.thumbnail = null;
    media.extra = null;

    const videoExtra = {
      duration: 120,
      thumbnails: [],
      needRegenerateThumbnail: true,
      thumbnailWidth: 0,
      thumbnailHeight: 0,
    };

    (extractMP4Extra as any).mockReturnValueOnce(
      fp.RTE.right(videoExtra),
    );

    (extractThumbnailsExtra as any).mockReturnValueOnce(
      fp.RTE.right({ thumbnailWidth: 0, thumbnailHeight: 0, thumbnails: [], needRegenerateThumbnail: true }),
    );

    const result = await pipe(extractMediaExtra(media)(ctx), throwTE);

    expect(extractMP4Extra).toHaveBeenCalledWith(media);
    expect((result as any).duration).toBe(120);
  });

  it("should use media.extra for unsupported media types", async () => {
    const existingExtra = { width: 300, height: 200, thumbnails: [] } as any;
    const media = new MediaEntity();
    media.id = "media-other-1";
    media.type = "application/pdf" as any;
    media.location = "https://example.com/doc.pdf" as any;
    media.thumbnail = null;
    media.extra = existingExtra;

    (extractThumbnailsExtra as any).mockReturnValueOnce(
      fp.RTE.right({ thumbnailWidth: 0, thumbnailHeight: 0, thumbnails: [], needRegenerateThumbnail: true }),
    );

    const result = await pipe(extractMediaExtra(media)(ctx), throwTE);

    expect(extractImageTypeExtra).not.toHaveBeenCalled();
    expect(extractMP4Extra).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("should return Left when extractImageTypeExtra fails", async () => {
    const media = new MediaEntity();
    media.id = "media-fail";
    media.type = "photo/jpeg" as any;
    media.location = "https://example.com/fail.jpg" as any;
    media.thumbnail = null;
    media.extra = null;

    (extractImageTypeExtra as any).mockReturnValueOnce(
      fp.RTE.left({ name: "ServerError", message: "exif error", status: 500 }),
    );

    const result = await extractMediaExtra(media)(ctx)();

    expect(result._tag).toBe("Left");
  });
});
