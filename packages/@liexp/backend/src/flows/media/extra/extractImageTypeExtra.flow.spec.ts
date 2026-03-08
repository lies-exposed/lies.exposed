import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { type ConfigContext } from "../../../context/config.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { type ImgProcClientContext } from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { mockedContext } from "../../../test/context.js";

vi.mock("../readExifMetadataFromImage.flow.js", () => ({
  readExifMetadataFromImage: vi.fn(),
}));

vi.mock("./extractThumbnailsExtra.flow.js", () => ({
  extractThumbnailsExtra: vi.fn(),
}));

import { readExifMetadataFromImage } from "../readExifMetadataFromImage.flow.js";
import { extractThumbnailsExtra } from "./extractThumbnailsExtra.flow.js";
import { extractImageTypeExtra } from "./extractImageTypeExtra.flow.js";
import type { SimpleImageMedia } from "../thumbnails/extractThumbnailFromImage.flow.js";

type ExtractImageContext = ConfigContext &
  HTTPProviderContext &
  ImgProcClientContext &
  LoggerContext;

describe(extractImageTypeExtra.name, () => {
  const mockImgProc = mockDeep<ImgProcClientContext["imgProc"]>();
  const mockHttp = mockDeep<HTTPProviderContext["http"]>();

  const ctx = mockedContext<ExtractImageContext>({
    imgProc: mockImgProc,
    http: mockHttp,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return ImageMediaExtra with dimensions from exif when no thumbnail", async () => {
    const media: SimpleImageMedia = {
      location: "https://example.com/image.jpg",
      thumbnail: null,
    } as any;

    (readExifMetadataFromImage as any).mockReturnValueOnce(
      fp.RTE.right({ width: 800, height: 600 }),
    );

    const result = await pipe(extractImageTypeExtra(media)(ctx), throwTE);

    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(extractThumbnailsExtra).not.toHaveBeenCalled();
  });

  it("should call extractThumbnailsExtra when thumbnail is present", async () => {
    const media: SimpleImageMedia = {
      location: "https://example.com/image.jpg",
      thumbnail: "https://example.com/thumb.jpg",
    } as any;

    (readExifMetadataFromImage as any).mockReturnValueOnce(
      fp.RTE.right({ width: 1024, height: 768 }),
    );

    (extractThumbnailsExtra as any).mockReturnValueOnce(
      fp.RTE.right({
        thumbnailWidth: 200,
        thumbnailHeight: 150,
        thumbnails: [],
        needRegenerateThumbnail: false,
      }),
    );

    const result = await pipe(extractImageTypeExtra(media)(ctx), throwTE);

    expect(extractThumbnailsExtra).toHaveBeenCalledWith(media.thumbnail);
    expect(result.thumbnailWidth).toBe(200);
    expect(result.thumbnailHeight).toBe(150);
  });

  it("should return Left when readExifMetadataFromImage fails", async () => {
    const media: SimpleImageMedia = {
      location: "https://example.com/bad.jpg",
      thumbnail: null,
    } as any;

    (readExifMetadataFromImage as any).mockReturnValueOnce(
      fp.RTE.left({ name: "ServerError", message: "fetch failed", status: 500 }),
    );

    const result = await extractImageTypeExtra(media)(ctx)();

    expect(result._tag).toBe("Left");
  });
});
