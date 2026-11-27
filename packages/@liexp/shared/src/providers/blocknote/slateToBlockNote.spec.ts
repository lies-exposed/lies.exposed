import { slateToBlockNote, type SlateConversion } from "./slateToBlockNote.js";

const reactPage = (...cells: unknown[]) => ({
  id: "doc",
  version: 1,
  rows: cells.map((cell, i) => ({ id: `row-${i}`, cells: [cell] })),
});

const slateCell = (...slate: unknown[]) => ({
  id: "cell",
  plugin: { id: "eco-slate-plugin", version: 1 },
  dataI18n: { en: { slate } },
  rows: [],
});

const paragraph = (...children: unknown[]) => ({
  type: "PARAGRAPH/PARAGRAPH",
  children,
});

const blocksOf = (result: SlateConversion) => {
  if (result.type !== "converted") {
    throw new Error(`expected a converted value: ${JSON.stringify(result)}`);
  }
  return result.value;
};

describe("slateToBlockNote", () => {
  it("leaves BlockNote documents, empty arrays and null untouched", () => {
    const document = [
      { id: "1", type: "paragraph", props: {}, content: [], children: [] },
    ];
    expect(slateToBlockNote(document).type).toBe("unchanged");
    expect(slateToBlockNote([]).type).toBe("unchanged");
    expect(slateToBlockNote(null).type).toBe("unchanged");
  });

  it("reports values without content as empty", () => {
    expect(slateToBlockNote({}).type).toBe("empty");
    expect(slateToBlockNote("").type).toBe("empty");
    expect(
      slateToBlockNote(reactPage(slateCell(paragraph({ text: "" })))).type,
    ).toBe("empty");
  });

  it("converts paragraphs with marks, alignment and links", () => {
    const [first] = blocksOf(
      slateToBlockNote(
        reactPage(
          slateCell({
            ...paragraph(
              { text: "bold", "EMPHASIZE/STRONG": true },
              {
                type: "LINK/LINK",
                data: { href: "https://example.com" },
                children: [{ text: "link" }],
              },
            ),
            data: { align: "center" },
          }),
        ),
      ),
    );
    expect(first).toMatchObject({
      type: "paragraph",
      props: { textAlignment: "center" },
      content: [
        { type: "text", text: "bold", styles: { bold: true } },
        {
          type: "link",
          href: "https://example.com",
          content: [{ type: "text", text: "link", styles: {} }],
        },
      ],
    });
  });

  it("converts headings, quotes, lists, dividers and media", () => {
    const item = (text: string) => ({
      type: "LISTS/LIST-ITEM",
      children: [{ text }],
    });
    const blocks = blocksOf(
      slateToBlockNote(
        reactPage(
          slateCell(
            {
              type: "HEADINGS/HEADING-TWO",
              children: [paragraph({ text: "title" })],
            },
            { type: "BLOCKQUOTE/BLOCKQUOTE", children: [{ text: "quote" }] },
            { type: "LISTS/UNORDERED-LIST", children: [item("a")] },
            { type: "LISTS/ORDERED-LIST", children: [item("b")] },
          ),
          {
            plugin: { id: "ory/editor/core/content/divider" },
            dataI18n: { en: null },
          },
          {
            plugin: { id: "liexp/editor/plugins/mediaBlock" },
            dataI18n: {
              en: { media: [{ id: "media-id" }], height: 400 },
            },
          },
        ),
      ),
    );
    expect(blocks.map((b) => b.type)).toEqual([
      "heading",
      "quote",
      "bulletListItem",
      "numberedListItem",
      "divider",
      "media",
    ]);
    expect(blocks[0].props).toMatchObject({ level: 2 });
    expect(blocks[5].props).toMatchObject({ id: "media-id", height: 400 });
  });

  it("treats elements without a type as paragraphs", () => {
    const blocks = blocksOf(
      slateToBlockNote(
        reactPage(
          slateCell(
            { children: [{ text: "one" }] },
            { children: [{ text: "two" }] },
          ),
        ),
      ),
    );
    expect(blocks.map((b) => b.type)).toEqual(["paragraph", "paragraph"]);
  });

  it("converts nested rows", () => {
    const blocks = blocksOf(
      slateToBlockNote(
        reactPage({
          rows: [{ cells: [slateCell(paragraph({ text: "nested" }))] }],
        }),
      ),
    );
    expect(blocks).toHaveLength(1);
  });

  it("converts plain strings and partial paragraphs", () => {
    expect(blocksOf(slateToBlockNote("one\ntwo"))).toHaveLength(2);
    expect(
      blocksOf(slateToBlockNote([{ type: "paragraph", content: "text" }])),
    ).toHaveLength(1);
  });

  it("drops links without text with a warning", () => {
    const result = slateToBlockNote(
      reactPage(
        slateCell(
          paragraph(
            { text: "text" },
            {
              type: "LINK/LINK",
              data: { href: "https://example.com" },
              children: [{ text: "" }],
            },
          ),
        ),
      ),
    );
    expect(result).toMatchObject({
      type: "converted",
      warnings: ["link without text dropped: https://example.com"],
    });
  });

  it("fails on content it cannot map", () => {
    expect(
      slateToBlockNote(
        reactPage(slateCell({ type: "UNKNOWN", children: [{ text: "x" }] })),
      ),
    ).toMatchObject({ type: "failed", unmapped: ["node:UNKNOWN"] });
    expect(slateToBlockNote({ some: "object" }).type).toBe("failed");
  });
});
