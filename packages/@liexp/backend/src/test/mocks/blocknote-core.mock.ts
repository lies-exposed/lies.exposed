import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { vi } from "vitest";

const editor = {
  tryParseHTMLToBlocks: vi.fn((str) => Promise.resolve(toInitialValue(str))),
};

const BlockNoteSchema = {
  create: vi.fn(() => {
    throw new Error("Not implemented");
  }),
};

const BlockNoteEditor = {
  create: vi.fn(() => editor),
};

const defaultBlockSpecs = {
  image: vi.fn(() => {
    throw new Error("Not implemented");
  }),
};

export { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs };
