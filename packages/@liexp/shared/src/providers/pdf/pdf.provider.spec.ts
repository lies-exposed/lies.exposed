import { pipe } from "fp-ts/lib/function.js";
import { describe, test, expect, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { throwTE } from "../../utils/fp.utils.js";
import { PDFProvider, PDFError } from "../pdf/pdf.provider.js";

const mockPdfDoc = (pages: string[]) => {
  return {
    numPages: pages.length,
    getPage: vi.fn((i: number) =>
      Promise.resolve({
        getTextContent: () =>
          Promise.resolve({
            items: [{ str: pages[i - 1] }],
          }),
      }),
    ),
  };
};

describe("PDFProvider", () => {
  test("getDocument returns PDFDocumentProxy", async () => {
    const client = mock<any>({
      getDocument: vi.fn(() => ({ promise: Promise.resolve("doc") })),
    });
    const provider = PDFProvider({ client });
    const result = await pipe(provider.getDocument(new Uint16Array()), throwTE);
    expect(result).toBe("doc");
  });

  test("getAllTextContents returns joined text", async () => {
    const doc = mockPdfDoc(["Hello", "World"]);
    const provider = PDFProvider({ client: {} as any });
    const result = await pipe(provider.getAllTextContents(doc as any), throwTE);
    expect(result).toBe("HelloWorld");
  });

  test("getDocument handles error", async () => {
    const client = {
      getDocument: vi.fn(() => {
        throw new Error("fail");
      }),
    } as any;
    const provider = PDFProvider({ client });
    await expect(
      pipe(provider.getDocument(new Uint16Array()), throwTE),
    ).rejects.toBeInstanceOf(PDFError);
  });

  test("getAllTextContents handles error", async () => {
    const doc = {
      numPages: 1,
      getPage: vi.fn(() => {
        throw new Error("fail");
      }),
    };
    const provider = PDFProvider({ client: {} as any });
    await expect(
      pipe(provider.getAllTextContents(doc as any), throwTE),
    ).rejects.toBeInstanceOf(PDFError);
  });
});
