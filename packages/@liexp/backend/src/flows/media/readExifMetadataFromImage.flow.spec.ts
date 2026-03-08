import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { type HTTPProviderContext } from "../../context/http.context.js";
import { type ImgProcClientContext } from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";

vi.mock("../url/fetchAsBuffer.flow.js", () => ({
  fetchAsBuffer: vi.fn(),
}));

import { fetchAsBuffer } from "../url/fetchAsBuffer.flow.js";
import { readExifMetadataFromImage } from "./readExifMetadataFromImage.flow.js";

type ReadExifContext = ImgProcClientContext & HTTPProviderContext & LoggerContext;

describe(readExifMetadataFromImage.name, () => {
  const mockImgProc = mockDeep<ImgProcClientContext["imgProc"]>();
  const mockHttp = mockDeep<HTTPProviderContext["http"]>();

  const ctx = mockedContext<ReadExifContext>({
    imgProc: mockImgProc,
    http: mockHttp,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return width and height from exif metadata", async () => {
    const location = "https://example.com/photo.jpg";
    const fakeBuffer = Buffer.from("fake-image-data");

    (fetchAsBuffer as any).mockReturnValueOnce(() =>
      fp.TE.right(fakeBuffer),
    );

    mockTERightOnce(mockImgProc.readExif, () => ({
      "Image Width": { value: 1920, description: "1920" },
      "Image Height": { value: 1080, description: "1080" },
    }));

    const result = await pipe(
      readExifMetadataFromImage(location)(ctx),
      throwTE,
    );

    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
  });

  it("should return undefined dimensions when exif tags are missing", async () => {
    const location = "https://example.com/photo.jpg";
    const fakeBuffer = Buffer.from("no-exif-data");

    (fetchAsBuffer as any).mockReturnValueOnce(() =>
      fp.TE.right(fakeBuffer),
    );

    mockTERightOnce(mockImgProc.readExif, () => ({}));

    const result = await pipe(
      readExifMetadataFromImage(location)(ctx),
      throwTE,
    );

    expect(result.width).toBeUndefined();
    expect(result.height).toBeUndefined();
  });

  it("should return Left when fetchAsBuffer fails", async () => {
    const location = "https://example.com/missing.jpg";
    const fetchError = { name: "HTTPError", message: "Not found", status: 404 };

    (fetchAsBuffer as any).mockReturnValueOnce(() =>
      fp.TE.left(fetchError),
    );

    const result = await readExifMetadataFromImage(location)(ctx)();

    expect(result._tag).toBe("Left");
  });

  it("should return Left when readExif fails", async () => {
    const location = "https://example.com/corrupt.jpg";
    const fakeBuffer = Buffer.from("corrupt");

    (fetchAsBuffer as any).mockReturnValueOnce(() =>
      fp.TE.right(fakeBuffer),
    );

    mockImgProc.readExif.mockImplementationOnce(() =>
      fp.TE.left({ name: "ImgProcError", message: "Cannot read exif", status: 500 } as any),
    );

    const result = await readExifMetadataFromImage(location)(ctx)();

    expect(result._tag).toBe("Left");
  });
});
