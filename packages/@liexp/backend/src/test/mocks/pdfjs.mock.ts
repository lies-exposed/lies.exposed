import type * as pdf from "pdfjs-dist/legacy/build/pdf.mjs";
import { mockDeep } from "vitest-mock-extended";

const pdfJsMock = mockDeep<typeof pdf>({});

export { pdfJsMock };
