import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { vi } from "vitest";

const editor = {
  tryParseHTMLToBlocks: vi.fn((str) => Promise.resolve(toInitialValue(str))),
};

const BlockNoteSchema = {
  create: vi.fn(),
};

const BlockNoteEditor = {
  create: vi.fn().mockReturnValue(editor),
};

const defaultBlockSpecs = {
  image: vi.fn(),
};

export { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs };
