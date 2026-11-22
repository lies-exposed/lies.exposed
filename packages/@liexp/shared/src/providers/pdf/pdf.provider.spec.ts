import { ctxHelper } from "@liexp/test";
import { IOError } from "@ts-endpoint/core";
import { pipe } from "fp-ts/lib/function.js";
import { describe, test, expect, vi } from "vitest";
import { throwTE } from "../../utils/fp.utils.js";
import {
  PDFProvider,
  PDFError,
  type PDFDocumentProxy,
  type PDFProviderContext,
} from "../pdf/pdf.provider.js";

const emptyClient = ctxHelper.ctx<PDFProviderContext["client"]>({});

interface PageFixture {
  getTextContent: () => Promise<unknown>;
}

interface DocFixture {
  numPages: number;
  getPage: ReturnType<typeof vi.fn>;
}

const mockPdfDoc = (pages: string[]): DocFixture => {
  return {
    numPages: pages.length,
    getPage: vi.fn((i: number): Promise<PageFixture> =>
      Promise.resolve({
        getTextContent: () =>
          Promise.resolve({
            items: [{ str: pages[i - 1] }],
          }),
      }),
    ),
  };
};

const docProxy = (doc: DocFixture): PDFDocumentProxy =>
  ctxHelper.ctx<PDFDocumentProxy>(doc);

describe("PDFProvider", () => {
  test("getDocument returns PDFDocumentProxy", async () => {
    const client = ctxHelper.ctx<PDFProviderContext["client"]>({
      getDocument: vi.fn(() => ({ promise: Promise.resolve("doc") })),
    });
    const provider = PDFProvider({ client });
    const result = await pipe(provider.getDocument(new Uint16Array()), throwTE);
    expect(result).toBe("doc");
  });

  test("getAllTextContents returns joined text", async () => {
    const doc = mockPdfDoc(["Hello", "World"]);
    const provider = PDFProvider({ client: emptyClient });
    const result = await pipe(
      provider.getAllTextContents(docProxy(doc)),
      throwTE,
    );
    expect(result).toBe("HelloWorld");
  });

  test("getDocument handles error", async () => {
    const client = ctxHelper.ctx<PDFProviderContext["client"]>({
      getDocument: vi.fn(() => {
        throw new Error("fail");
      }),
    });
    const provider = PDFProvider({ client });
    await expect(
      pipe(provider.getDocument(new Uint16Array()), throwTE),
    ).rejects.toBeInstanceOf(PDFError);
  });

  test("getAllTextContents handles error", async () => {
    const doc: DocFixture = {
      numPages: 1,
      getPage: vi.fn((): Promise<PageFixture> => {
        throw new Error("fail");
      }),
    };
    const provider = PDFProvider({ client: emptyClient });
    await expect(
      pipe(provider.getAllTextContents(docProxy(doc)), throwTE),
    ).rejects.toBeInstanceOf(PDFError);
  });

  test("getDocument passes cMap options to client", async () => {
    const client = ctxHelper.ctx<PDFProviderContext["client"]>({
      getDocument: vi.fn(() => ({ promise: Promise.resolve("doc") })),
    });
    const provider = PDFProvider({
      client,
      cMapUrl: "cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "fonts/",
    });
    await pipe(provider.getDocument(new Uint16Array()), throwTE);
    expect(client.getDocument).toHaveBeenCalledWith({
      data: expect.any(Uint16Array),
      cMapUrl: "cmaps/",
      cMapPacked: true,
      standardFontDataUrl: "fonts/",
    });
  });

  test("getAllTextContents handles empty PDF (0 pages)", async () => {
    const doc: DocFixture = {
      numPages: 0,
      getPage: vi.fn(),
    };
    const provider = PDFProvider({ client: emptyClient });
    const result = await pipe(
      provider.getAllTextContents(docProxy(doc)),
      throwTE,
    );
    expect(result).toBe("");
  });

  test("getAllTextContents filters items without str property", async () => {
    const doc: DocFixture = {
      numPages: 1,
      getPage: vi.fn((): Promise<PageFixture> =>
        Promise.resolve({
          getTextContent: () =>
            Promise.resolve({
              items: [
                { str: "valid text" },
                { index: 5 }, // no str property
                { str: "more text" },
                { str: 123 }, // str is not a string
              ],
            }),
        }),
      ),
    };
    const provider = PDFProvider({ client: emptyClient });
    const result = await pipe(
      provider.getAllTextContents(docProxy(doc)),
      throwTE,
    );
    expect(result).toBe("valid textmore text");
  });

  test("getAllTextContents handles multiple pages correctly", async () => {
    const pages = ["Page1", "Page2", "Page3"];
    const doc = mockPdfDoc(pages);
    const provider = PDFProvider({ client: emptyClient });
    const result = await pipe(
      provider.getAllTextContents(docProxy(doc)),
      throwTE,
    );
    expect(result).toBe("Page1Page2Page3");
    expect(doc.getPage).toHaveBeenCalledTimes(3);
    expect(doc.getPage).toHaveBeenCalledWith(1);
    expect(doc.getPage).toHaveBeenCalledWith(2);
    expect(doc.getPage).toHaveBeenCalledWith(3);
  });
});

describe("PDFError", () => {
  test("has correct name", () => {
    const error = new PDFError("test", {
      kind: "ServerError",
      status: "500",
    });
    expect(error.name).toBe("PDFError");
  });

  test("extends IOError", () => {
    const error = new PDFError("test", {
      kind: "ServerError",
      status: "500",
    });
    expect(error).toBeInstanceOf(IOError);
  });
});
