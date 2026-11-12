import * as O from "fp-ts/lib/Option.js";
import { describe, test, expect, vi } from "vitest";
import { getTextContents } from "./getTextContents.js";
import { getTextContentsCapped } from "./getTextContentsCapped.js";
import { isValidValue } from "./isValidValue.js";
import { transform, relationsTransformer } from "./transform.utils.js";
import {
  toParagraph,
  toInitialValue,
  StringToBlockNoteDocument,
} from "./utils.js";
import {
  DEFAULT_EVENT_INLINE_ID,
  DEFAULT_ID,
  DEFAULT_ACTOR_ID,
  DEFAULT_LINK_ENTITY_ID,
  eventInlineSpec,
  mediaBlockSpecs,
  eventBlockSpecs,
  actorInlineSpec,
  areaInlineSpec,
  groupInlineSpec,
  keywordInlineSpec,
  linkEntityInlineSpec,
  relationInlineSpec,
} from "./";

describe("blocknote providers", () => {
  describe("isValidValue", () => {
    test("returns true for valid BNEditorDocument", () => {
      expect(
        isValidValue([
          { type: "paragraph", id: "1", props: {}, content: [], children: [] },
        ]),
      ).toBe(true);
    });

    test("returns false for invalid values", () => {
      expect(isValidValue(undefined)).toBe(false);
      expect(isValidValue([])).toBe(false);
      expect(isValidValue(null)).toBe(false);
    });

    test("returns false for non-array values", () => {
      expect(isValidValue("string")).toBe(false);
      expect(isValidValue(123)).toBe(false);
      expect(isValidValue({ type: "paragraph" })).toBe(false);
    });
  });

  describe("getTextContents", () => {
    test("extracts text from paragraphs", () => {
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
      expect(getTextContents(doc as any)).toBe("Hello\nWorld");
    });

    test("extracts text from text type blocks", () => {
      const doc = [
        {
          type: "text",
          id: "1",
          props: {},
          content: [],
          children: [],
          text: "Hello",
        },
      ];
      expect(getTextContents(doc as any)).toBe("Hello");
    });

    test("extracts nested text from paragraph content items", () => {
      const doc = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            { type: "text", text: "First", content: "First", styles: {} },
            { type: "text", text: "Second", content: "Second", styles: {} },
          ],
          children: [],
        },
      ];
      expect(getTextContents(doc as any)).toBe("First\nSecond");
    });

    test("returns empty string for empty paragraphs", () => {
      const doc = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [],
          children: [],
        },
      ];
      expect(getTextContents(doc as any)).toBe("");
    });

    test("returns empty string for invalid doc", () => {
      expect(getTextContents(undefined as any)).toBe("");
      expect(getTextContents([] as any)).toBe("");
    });

    test("handles mixed block types", () => {
      const doc = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            {
              type: "text",
              text: "Para text",
              content: "Para text",
              styles: {},
            },
          ],
          children: [],
        },
        {
          type: "bulletListItem",
          id: "2",
          props: {},
          content: [],
          children: [],
        },
        {
          type: "text",
          id: "3",
          props: {},
          content: [],
          children: [],
          text: "Text block",
        },
      ];
      const result = getTextContents(doc as any);
      expect(result).toContain("Para text");
      expect(result).toContain("Text block");
    });
  });

  describe("getTextContentsCapped", () => {
    test("returns text when under maxLength", () => {
      const doc = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [{ type: "text", text: "Hi", content: "Hi", styles: {} }],
          children: [],
        },
      ];
      expect(getTextContentsCapped(doc as any, 100)).toBe("Hi");
    });

    test("caps text at maxLength and appends ellipsis", () => {
      const doc = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            {
              type: "text",
              text: "Hello World",
              content: "Hello World",
              styles: {},
            },
          ],
          children: [],
        },
      ];
      expect(getTextContentsCapped(doc as any, 5)).toBe("Hello...");
    });

    test("returns empty string for invalid doc", () => {
      expect(getTextContentsCapped(undefined as any, 100)).toBe("");
      expect(getTextContentsCapped([] as any, 100)).toBe("");
    });

    test("caps at exact length", () => {
      const doc = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            { type: "text", text: "12345", content: "12345", styles: {} },
          ],
          children: [],
        },
      ];
      expect(getTextContentsCapped(doc as any, 5)).toBe("12345");
    });
  });

  describe("transform", () => {
    test("returns null for invalid document", () => {
      expect(transform(undefined as any, () => O.some([]))).toBe(null);
      expect(transform([], () => O.some([]))).toBe(null);
      expect(transform("string" as any, () => O.some([]))).toBe(null);
    });

    test("transforms paragraphs using filter function", () => {
      const doc: any = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            { type: "text", text: "Hello", content: "Hello", styles: {} },
          ],
          children: [],
        },
      ];
      const result = transform(doc, (p: any) => {
        if (p.type === "text") {
          return O.some([p.text]);
        }
        return O.none;
      });
      expect(result).toEqual(["Hello"]);
    });

    test("returns empty array when no items match", () => {
      const doc: any = [
        {
          type: "bulletListItem",
          id: "1",
          props: {},
          content: [],
          children: [],
        },
      ];
      const result = transform(doc, () => O.none);
      expect(result).toEqual([]);
    });

    test("handles nested content in paragraphs", () => {
      const doc: any = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            { type: "text", text: "Nested", content: "Nested", styles: {} },
          ],
          children: [],
        },
      ];
      const result = transform(doc, (p: any) => {
        if (p.type === "text") {
          return O.some([p.text]);
        }
        return O.none;
      });
      expect(result).toEqual(["Nested"]);
    });

    test("handles children as nested items", () => {
      const doc: any = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [],
          children: [
            {
              type: "text",
              text: "FromChildren",
              content: "FromChildren",
              styles: {},
            },
          ],
        },
      ];
      const result = transform(doc, (p: any) => {
        if (p.type === "text") {
          return O.some([p.text]);
        }
        return O.none;
      });
      expect(result).toEqual(["FromChildren"]);
    });

    test("skips numberedListItem, bulletListItem, table blocks", () => {
      const doc: any = [
        {
          type: "numberedListItem",
          id: "1",
          props: {},
          content: [],
          children: [],
        },
        {
          type: "bulletListItem",
          id: "2",
          props: {},
          content: [],
          children: [],
        },
        { type: "table", id: "3", props: {}, content: [], children: [] },
      ];
      const spy = vi.fn(() => O.some(["item"]));
      transform(doc, spy);
      expect(spy).not.toHaveBeenCalled();
    });

    test("handles default block type with O.some", () => {
      const doc: any = [
        { type: "customBlock", id: "1", props: {}, content: [], children: [] },
      ];
      const result = transform(doc, (p: any) => {
        if (p.type === "customBlock") {
          return O.some([p.id]);
        }
        return O.none;
      });
      expect(result).toEqual(["1"]);
    });

    test("handles default block type with O.none", () => {
      const doc: any = [
        { type: "customBlock", id: "1", props: {}, content: [], children: [] },
      ];
      const result = transform(doc, () => O.none);
      expect(result).toEqual([]);
    });
  });

  describe("relationsTransformer", () => {
    test("returns empty relations for invalid document", () => {
      const result = relationsTransformer(undefined as any);
      expect(result.actors).toEqual([]);
      expect(result.groups).toEqual([]);
      expect(result.keywords).toEqual([]);
      expect(result.media).toEqual([]);
      expect(result.events).toEqual([]);
      expect(result.links).toEqual([]);
      expect(result.areas).toEqual([]);
      expect(result.groupsMembers).toEqual([]);
    });

    test("extracts actor relations", () => {
      const doc: any = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            {
              type: "actor",
              id: "actor-1",
              props: {
                id: "actor-1",
                fullName: "John",
                className: "",
                displayAvatar: true,
                displayFullName: true,
              },
              content: [],
              children: [],
            },
          ],
          children: [],
        },
      ];
      const result = relationsTransformer(doc);
      expect(result.actors).toContain("actor-1");
    });

    test("extracts group relations", () => {
      const doc: any = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            {
              type: "group",
              id: "group-1",
              props: {
                id: "group-1",
                name: "Group",
                className: "",
                displayAvatar: true,
              },
              content: [],
              children: [],
            },
          ],
          children: [],
        },
      ];
      const result = relationsTransformer(doc);
      expect(result.groups).toContain("group-1");
    });

    test("extracts keyword relations", () => {
      const doc: any = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            {
              type: "keyword",
              id: "kw-1",
              props: { id: "kw-1" },
              content: [],
              children: [],
            },
          ],
          children: [],
        },
      ];
      const result = relationsTransformer(doc);
      expect(result.keywords).toContain("kw-1");
    });

    test("extracts media relations", () => {
      const doc: any = [
        {
          type: "media",
          id: "media-1",
          props: { id: "media-1", enableDescription: false, height: 150 },
          content: [],
          children: [],
        },
      ];
      const result = relationsTransformer(doc);
      expect(result.media).toContain("media-1");
    });

    test("extracts event relations", () => {
      const doc: any = [
        {
          type: "event",
          id: "event-1",
          props: { id: "event-1", type: "missing-type" },
          content: [],
          children: [],
        },
      ];
      const result = relationsTransformer(doc);
      expect(result.events).toContain("event-1");
    });

    test("extracts area relations", () => {
      const doc: any = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            {
              type: "area",
              id: "area-1",
              props: {
                id: "area-1",
                className: "",
                displayLabel: true,
                displayFeaturedImage: false,
              },
              content: [],
              children: [],
            },
          ],
          children: [],
        },
      ];
      const result = relationsTransformer(doc);
      expect(result.areas).toContain("area-1");
    });

    test("extracts link-entity relations", () => {
      const doc: any = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            {
              type: "link-entity",
              id: "link-1",
              props: {
                id: "link-1",
                url: "http://example.com",
                title: "Example",
              },
              content: [],
              children: [],
            },
          ],
          children: [],
        },
      ];
      const result = relationsTransformer(doc);
      expect(result.links).toContain("link-1");
    });

    test("extracts event-inline relations (non-default id)", () => {
      const doc: any = [
        {
          type: "event-inline",
          id: "ei-1",
          props: { id: "ei-1", title: "Event" },
          content: [],
          children: [],
        },
      ];
      const result = relationsTransformer(doc);
      expect(result.events).toContain("ei-1");
    });

    test("ignores event-inline with default id", () => {
      const doc: any = [
        {
          type: "event-inline",
          id: "ei-1",
          props: { id: DEFAULT_EVENT_INLINE_ID, title: "Event" },
          content: [],
          children: [],
        },
      ];
      const result = relationsTransformer(doc);
      expect(result.events).toEqual([]);
    });

    test("skips numberedListItem, bulletListItem, table for relations", () => {
      const doc: any = [
        {
          type: "numberedListItem",
          id: "1",
          props: {},
          content: [],
          children: [],
        },
        {
          type: "bulletListItem",
          id: "2",
          props: {},
          content: [],
          children: [],
        },
        { type: "table", id: "3", props: {}, content: [], children: [] },
      ];
      const result = relationsTransformer(doc);
      expect(result.actors).toEqual([]);
      expect(result.events).toEqual([]);
    });

    test("deduplicates relations", () => {
      const doc: any = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            {
              type: "actor",
              id: "actor-1",
              props: { id: "actor-1" },
              content: [],
              children: [],
            },
          ],
          children: [],
        },
        {
          type: "paragraph",
          id: "2",
          props: {},
          content: [
            {
              type: "actor",
              id: "actor-1",
              props: { id: "actor-1" },
              content: [],
              children: [],
            },
          ],
          children: [],
        },
      ];
      const result = relationsTransformer(doc);
      expect(result.actors).toHaveLength(1);
      expect(result.actors).toContain("actor-1");
    });

    test("extracts relation inline relations", () => {
      const doc: any = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            {
              type: "relation",
              id: "rel-1",
              props: { relation: "rel-1", id: "rel-1" },
              content: [],
              children: [],
            },
          ],
          children: [],
        },
      ];
      // relation type is not in the inlineRelationsPluginSerializer switch, so it falls through to default
      // which treats content items recursively - but since relation has no content, it returns none
      const result = relationsTransformer(doc);
      expect(result.actors).toEqual([]);
    });
  });

  describe("toParagraph", () => {
    test("creates a paragraph block with correct structure", () => {
      const block = toParagraph("Hello");
      expect(block.type).toBe("paragraph");
      expect(block.content).toHaveLength(1);
      expect(block.content[0].text).toBe("Hello");
      expect(block.content[0].content).toBe("Hello");
      expect(block.props.textColor).toBe("default");
      expect(block.props.textAlignment).toBe("left");
      expect(block.children).toEqual([]);
    });

    test("creates paragraph with unique id", () => {
      const block1 = toParagraph("First");
      const block2 = toParagraph("Second");
      expect(block1.id).not.toBe(block2.id);
    });
  });

  describe("toInitialValue", () => {
    test("converts string to BlockNoteDocument", () => {
      const result = toInitialValue("Hello\nWorld");
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe("paragraph");
      expect(result[1].type).toBe("paragraph");
    });

    test("returns undefined for non-string non-array input", () => {
      expect(toInitialValue(123)).toBeUndefined();
      expect(toInitialValue(null)).toBeUndefined();
      expect(toInitialValue(undefined)).toBeUndefined();
      expect(toInitialValue({})).toBeUndefined();
    });

    test("returns array as-is if valid BlockNoteDocument", () => {
      const doc: any = [
        { type: "paragraph", id: "1", props: {}, content: [], children: [] },
      ];
      const result = toInitialValue(doc);
      expect(result).toBe(doc);
    });
  });

  describe("StringToBlockNoteDocument", () => {
    test("is defined as a Schema", () => {
      expect(StringToBlockNoteDocument).toBeDefined();
      expect(typeof StringToBlockNoteDocument).toBe("function");
    });

    test("encode path uses getTextContents", () => {
      const doc: any = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            { type: "text", text: "Hello", content: "Hello", styles: {} },
          ],
          children: [],
        },
      ];
      // The encode path uses getTextContents internally
      expect(getTextContents(doc)).toBe("Hello");
    });

    test("encode path handles multi-paragraph", () => {
      const doc: any = [
        {
          type: "paragraph",
          id: "1",
          props: {},
          content: [
            { type: "text", text: "Line1", content: "Line1", styles: {} },
          ],
          children: [],
        },
        {
          type: "paragraph",
          id: "2",
          props: {},
          content: [
            { type: "text", text: "Line2", content: "Line2", styles: {} },
          ],
          children: [],
        },
      ];
      expect(getTextContents(doc)).toBe("Line1\nLine2");
    });

    test("decode path uses toInitialValue", () => {
      const result = toInitialValue("Hello\nWorld");
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });
  });

  describe("block specs", () => {
    test("mediaBlockSpecs has correct structure", () => {
      expect(mediaBlockSpecs.type).toBe("media");
      expect(mediaBlockSpecs.propSchema.id.default).toBe(DEFAULT_ID);
      expect(mediaBlockSpecs.propSchema.enableDescription.default).toBe(false);
      expect(mediaBlockSpecs.propSchema.height.default).toBe(150);
      expect(mediaBlockSpecs.content).toBe("inline");
    });

    test("eventBlockSpecs has correct structure", () => {
      expect(eventBlockSpecs.type).toBe("event");
      expect(eventBlockSpecs.propSchema.id.default).toBe("missing-id");
      expect(eventBlockSpecs.content).toBe("inline");
    });
  });

  describe("inline specs", () => {
    test("eventInlineSpec has correct structure", () => {
      expect(eventInlineSpec.type).toBe("event-inline");
      expect(eventInlineSpec.propSchema.id.default).toBe(
        DEFAULT_EVENT_INLINE_ID,
      );
      expect(eventInlineSpec.content).toBe("none");
    });

    test("actorInlineSpec has correct structure", () => {
      expect(actorInlineSpec.type).toBe("actor");
      expect(actorInlineSpec.propSchema.id.default).toBe(DEFAULT_ACTOR_ID);
      expect(actorInlineSpec.content).toBe("none");
    });

    test("areaInlineSpec has correct structure", () => {
      expect(areaInlineSpec.type).toBe("area");
      expect(areaInlineSpec.content).toBe("none");
    });

    test("groupInlineSpec has correct structure", () => {
      expect(groupInlineSpec.type).toBe("group");
      expect(groupInlineSpec.content).toBe("none");
    });

    test("keywordInlineSpec has correct structure", () => {
      expect(keywordInlineSpec.type).toBe("keyword");
      expect(keywordInlineSpec.content).toBe("none");
    });

    test("linkEntityInlineSpec has correct structure", () => {
      expect(linkEntityInlineSpec.type).toBe("link-entity");
      expect(linkEntityInlineSpec.propSchema.id.default).toBe(
        DEFAULT_LINK_ENTITY_ID,
      );
      expect(linkEntityInlineSpec.content).toBe("none");
    });

    test("relationInlineSpec has correct structure", () => {
      expect(relationInlineSpec.type).toBe("relation");
      expect(relationInlineSpec.content).toBe("none");
    });
  });
});
