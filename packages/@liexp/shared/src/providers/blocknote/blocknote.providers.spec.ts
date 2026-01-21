import { describe, test, expect } from "vitest";
import { getTextContents } from "./getTextContents.js";
import { isValidValue } from "./isValidValue.js";

describe("blocknote providers", () => {
  test("isValidValue returns true for valid BNEditorDocument", () => {
    expect(
      isValidValue([
        { type: "paragraph", id: "1", props: {}, content: [], children: [] },
      ]),
    ).toBe(true);
  });

  test("isValidValue returns false for invalid values", () => {
    expect(isValidValue(undefined)).toBe(false);
    expect(isValidValue([])).toBe(false);
    expect(isValidValue(null)).toBe(false);
  });

  test("getTextContents extracts text from paragraphs", () => {
    const doc = [
      {
        type: "paragraph",
        id: "1",
        props: {},
        content: [
          { type: "text", text: "Hello", content: "Hello", styles: {} },
        ],
        children: [],
      },
      {
        type: "paragraph",
        id: "2",
        props: {},
        content: [
          { type: "text", text: "World", content: "World", styles: {} },
        ],
        children: [],
      },
    ];
    expect(getTextContents(doc)).toBe("Hello\nWorld");
  });

  test("getTextContents returns empty string for invalid doc", () => {
    expect(getTextContents(undefined as any)).toBe("");
    expect(getTextContents([] as any)).toBe("");
  });
});
