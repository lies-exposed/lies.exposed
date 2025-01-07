import { vi } from "vitest";

const editor = {
  tryParseHTMLToBlocks: vi.fn((str) =>
    Promise.resolve([
      {
        type: "paragraph",
        content: str,
      },
    ]),
  ),
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
