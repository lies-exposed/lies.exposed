import { fp } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/io/lib/http/Common/URL.js";
import { PDFType } from "@liexp/io/lib/http/Media/MediaType.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { mockedContext } from "../../../test/context.js";
import { type CreateAndUploadFlowContext } from "../../media/uploadAndCreate.flow.js";
import { parsePDFURL, parsePDFURLs } from "../parsePDFURL.flow.js";

const PDF_URL = "https://example.com/report.pdf" as URL;
const UPLOADED_LOCATION = "https://storage.example.com/media/report.pdf" as URL;

const makeCtx = () =>
  mockedContext<CreateAndUploadFlowContext>({
    db: mockDeep(),
    s3: mockDeep(),
    http: mockDeep(),
    fs: mockDeep(),
    queue: mockDeep(),
    redis: mockDeep(),
  });

const setupMocks = (ctx: ReturnType<typeof makeCtx>) => {
  ctx.http.get.mockReturnValue(fp.TE.right(Buffer.from("%PDF-1.4 test")));

  ctx.s3.upload.mockReturnValue(
    fp.TE.right({ Location: UPLOADED_LOCATION } as any),
  );

  ctx.db.save.mockReturnValue(
    fp.TE.right([
      {
        id: "test-uuid",
        type: PDFType.literals[0],
        location: UPLOADED_LOCATION,
        label: "report.pdf",
      },
    ] as any),
  );
};

describe("parsePDFURL", () => {
  const ctx = makeCtx();

  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks(ctx);
  });

  test("downloads the PDF and creates a media entity", async () => {
    const mediaId = await throwTE(parsePDFURL<typeof ctx>(PDF_URL)(ctx));

    expect(typeof mediaId).toBe("string");
    expect(ctx.http.get).toHaveBeenCalledWith(PDF_URL, {
      responseType: "arraybuffer",
    });
    expect(ctx.s3.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        ContentType: PDFType.literals[0],
      }),
    );
    expect(ctx.db.save).toHaveBeenCalled();
  });

  test("uses the filename from the URL as label", async () => {
    await throwTE(
      parsePDFURL<typeof ctx>(
        "https://example.com/path/to/document.pdf" as URL,
      )(ctx),
    );

    expect(ctx.db.save).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({ label: "document.pdf" }),
      ]),
    );
  });

  test("returns an error when HTTP download fails", async () => {
    ctx.http.get.mockReturnValue(fp.TE.left(new Error("Network error") as any));

    const result = await parsePDFURL<typeof ctx>(PDF_URL)(ctx)();

    expect(fp.E.isLeft(result)).toBe(true);
  });
});

describe("parsePDFURLs", () => {
  const ctx = makeCtx();

  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks(ctx);
  });

  test("returns an empty array for an empty URL list", async () => {
    const result = await throwTE(parsePDFURLs<typeof ctx>([])(ctx));
    expect(result).toEqual([]);
    expect(ctx.http.get).not.toHaveBeenCalled();
  });

  test("processes multiple PDF URLs sequentially", async () => {
    const urls = [
      "https://example.com/a.pdf" as URL,
      "https://example.com/b.pdf" as URL,
    ];

    const result = await throwTE(parsePDFURLs<typeof ctx>(urls)(ctx));

    expect(result).toHaveLength(2);
    expect(ctx.http.get).toHaveBeenCalledTimes(2);
  });
});
