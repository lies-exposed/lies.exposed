/**
 * Conversion of the legacy rich text values (react-page documents with slate
 * cells, and a few other leftovers) into BlockNote documents.
 *
 * The conversion is pure and never drops content silently: anything it cannot
 * map is reported in `unmapped`, and the caller must not persist such a value.
 */
import { BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";

export interface ConvertedBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
  content: unknown[];
  children: ConvertedBlock[];
}

export interface ConversionIssues {
  /** content that has no BlockNote equivalent: the value must not be replaced */
  unmapped: string[];
  /** lossy or approximate mappings worth a manual look */
  warnings: string[];
}

export type SlateConversion =
  /** already a BlockNote document, or an empty array: left as it is */
  | { type: "unchanged" }
  /** no content at all: the value can be replaced with null */
  | ({ type: "empty" } & ConversionIssues)
  | ({ type: "converted"; value: ConvertedBlock[] } & ConversionIssues)
  | ({ type: "failed" } & ConversionIssues);

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

const asString = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;

const MARKS: Record<string, string> = {
  "EMPHASIZE/EM": "italic",
  "EMPHASIZE/STRONG": "bold",
  "CODE/CODE": "code",
};

const HEADING_LEVELS: Record<string, number> = {
  "HEADINGS/HEADING-ONE": 1,
  "HEADINGS/HEADING-TWO": 2,
  "HEADINGS/HEADING-THREE": 3,
};

const LIST_ITEM = "LISTS/LIST-ITEM";
const UNORDERED_LIST = "LISTS/UNORDERED-LIST";
const ORDERED_LIST = "LISTS/ORDERED-LIST";
const LINK = "LINK/LINK";
const PARAGRAPH = "PARAGRAPH/PARAGRAPH";
/** editor artifact: only wraps the (usually empty) text typed by the user */
const COMPONENT_PICKER = "liexp/plugin/component-picker-popover";

const SLATE_PLUGIN = "eco-slate-plugin";
const DIVIDER_PLUGIN = "ory/editor/core/content/divider";
const MEDIA_PLUGIN = "liexp/editor/plugins/mediaBlock";

const block = (
  type: string,
  content: unknown[],
  props: Obj = {},
  children: ConvertedBlock[] = [],
): ConvertedBlock => ({
  id: uuid(),
  type,
  props,
  content,
  children,
});

const textBlock = (
  type: string,
  content: unknown[],
  align: unknown,
  props: Obj = {},
  children: ConvertedBlock[] = [],
): ConvertedBlock =>
  block(
    type,
    content,
    {
      textColor: "default",
      backgroundColor: "default",
      // the quote block has no alignment prop
      ...(type === "quote" ? {} : { textAlignment: asString(align) ?? "left" }),
      ...props,
    },
    children,
  );

const toText = (node: Obj, issues: ConversionIssues): unknown[] => {
  const text = asString(node.text) ?? "";
  if (text === "") {
    return [];
  }
  const styles = Object.keys(node).reduce<Obj>((acc, key) => {
    if (key === "text" || !node[key]) {
      return acc;
    }
    const style = MARKS[key];
    if (!style) {
      issues.unmapped.push(`mark:${key}`);
      return acc;
    }
    return { ...acc, [style]: true };
  }, {});
  return [{ type: "text", text, styles }];
};

const toInline = (node: unknown, issues: ConversionIssues): unknown[] => {
  if (!isObj(node)) {
    issues.unmapped.push(`inline:${typeof node}`);
    return [];
  }
  if (typeof node.text === "string") {
    return toText(node, issues);
  }

  const children = () =>
    asArray(node.children).flatMap((c) => toInline(c, issues));

  switch (nodeType(node)) {
    case LINK: {
      const href = isObj(node.data) ? asString(node.data.href) : undefined;
      const content = children();
      if (!href) {
        issues.warnings.push("link without href kept as plain text");
        return content;
      }
      if (content.length === 0) {
        issues.warnings.push(`link without text dropped: ${href}`);
        return [];
      }
      return [{ type: "link", href, content }];
    }
    case PARAGRAPH:
    case COMPONENT_PICKER: {
      return children();
    }
    default: {
      issues.unmapped.push(`inline:${String(node.type)}`);
      return [];
    }
  }
};

/** slate elements without a type are rendered as paragraphs */
const nodeType = (node: Obj): string | undefined =>
  node.type === undefined && Array.isArray(node.children)
    ? PARAGRAPH
    : asString(node.type);

const isBlockNode = (node: unknown): node is Obj => {
  if (!isObj(node)) {
    return false;
  }
  const type = nodeType(node);
  return type !== undefined && type !== LINK && type !== COMPONENT_PICKER;
};

/**
 * Split the children of a container node (heading, quote, list item) in the
 * lines of text it holds and the nested lists.
 */
const toLines = (
  node: Obj,
  issues: ConversionIssues,
): { lines: unknown[][]; nested: ConvertedBlock[] } => {
  const lines: unknown[][] = [];
  const nested: ConvertedBlock[] = [];
  let inline: unknown[] = [];
  const flush = (): void => {
    if (inline.length > 0) {
      lines.push(inline);
      inline = [];
    }
  };

  for (const child of asArray(node.children)) {
    if (!isBlockNode(child)) {
      inline.push(...toInline(child, issues));
      continue;
    }
    flush();
    if (nodeType(child) === PARAGRAPH) {
      lines.push(asArray(child.children).flatMap((c) => toInline(c, issues)));
    } else {
      nested.push(...toBlocks(child, issues));
    }
  }
  flush();

  return { lines, nested };
};

const toListItem = (
  node: Obj,
  type: "bulletListItem" | "numberedListItem",
  issues: ConversionIssues,
): ConvertedBlock => {
  const { lines, nested } = toLines(node, issues);
  const content = lines.flatMap((line, i) =>
    i === 0 ? line : [{ type: "text", text: "\n", styles: {} }, ...line],
  );
  return textBlock(type, content, undefined, {}, nested);
};

const toBlocks = (
  node: unknown,
  issues: ConversionIssues,
): ConvertedBlock[] => {
  if (!isBlockNode(node)) {
    const content = toInline(node, issues);
    return content.length > 0
      ? [textBlock("paragraph", content, undefined)]
      : [];
  }

  const type = nodeType(node) ?? "";
  const align = isObj(node.data) ? node.data.align : undefined;

  if (type === PARAGRAPH) {
    // a paragraph may wrap other blocks (e.g. a list): split around them
    const blocks: ConvertedBlock[] = [];
    let inline: unknown[] = [];
    let hasNestedBlocks = false;
    for (const child of asArray(node.children)) {
      if (isBlockNode(child)) {
        hasNestedBlocks = true;
        if (inline.length > 0) {
          blocks.push(textBlock("paragraph", inline, align));
          inline = [];
        }
        blocks.push(...toBlocks(child, issues));
      } else {
        inline.push(...toInline(child, issues));
      }
    }
    if (inline.length > 0 || !hasNestedBlocks) {
      blocks.push(textBlock("paragraph", inline, align));
    }
    return blocks;
  }

  const level = HEADING_LEVELS[type];
  if (level !== undefined || type === "BLOCKQUOTE/BLOCKQUOTE") {
    const { lines, nested } = toLines(node, issues);
    const target = level !== undefined ? "heading" : "quote";
    if (lines.length > 1) {
      issues.warnings.push(`${target} split in ${lines.length} blocks`);
    }
    return [
      ...lines.map((line) =>
        textBlock(
          target,
          line,
          align,
          level !== undefined ? { level } : undefined,
        ),
      ),
      ...nested,
    ];
  }

  if (type === UNORDERED_LIST || type === ORDERED_LIST) {
    const itemType =
      type === ORDERED_LIST ? "numberedListItem" : "bulletListItem";
    return asArray(node.children).flatMap((child) =>
      isObj(child) && child.type === LIST_ITEM
        ? [toListItem(child, itemType, issues)]
        : toBlocks(child, issues),
    );
  }

  if (type === LIST_ITEM) {
    return [toListItem(node, "bulletListItem", issues)];
  }

  issues.unmapped.push(`node:${type}`);
  return [];
};

const toMediaBlocks = (data: Obj, issues: ConversionIssues): ConvertedBlock[] =>
  asArray(data.media).flatMap((media) => {
    const id = isObj(media) ? asString(media.id) : undefined;
    if (!id) {
      issues.unmapped.push("media without id");
      return [];
    }
    return [
      block("media", [], {
        id,
        enableDescription: data.enableDescription === true,
        height: typeof data.height === "number" ? data.height : 150,
      }),
    ];
  });

const cellData = (cell: Obj): Obj => {
  if (!isObj(cell.dataI18n)) {
    return {};
  }
  const data = cell.dataI18n.en ?? Object.values(cell.dataI18n)[0];
  return isObj(data) ? data : {};
};

const cellToBlocks = (
  cell: unknown,
  issues: ConversionIssues,
): ConvertedBlock[] => {
  if (!isObj(cell)) {
    issues.unmapped.push(`cell:${typeof cell}`);
    return [];
  }
  const plugin = isObj(cell.plugin) ? asString(cell.plugin.id) : undefined;
  const data = cellData(cell);
  if (isObj(cell.dataI18n) && Object.keys(cell.dataI18n).length > 1) {
    issues.unmapped.push("cell with more than one language");
  }
  const nested = rowsToBlocks(cell.rows, issues);

  switch (plugin) {
    case undefined: {
      if (Object.keys(data).length > 0 || cell.content || cell.inline) {
        issues.unmapped.push("cell with data and no plugin");
      }
      return nested;
    }
    case SLATE_PLUGIN: {
      if (!Array.isArray(data.slate)) {
        issues.unmapped.push("slate cell without slate data");
        return nested;
      }
      return [...data.slate.flatMap((n) => toBlocks(n, issues)), ...nested];
    }
    case DIVIDER_PLUGIN: {
      return [block("divider", [], {}), ...nested];
    }
    case MEDIA_PLUGIN: {
      return [...toMediaBlocks(data, issues), ...nested];
    }
    default: {
      issues.unmapped.push(`plugin:${plugin}`);
      return nested;
    }
  }
};

const rowsToBlocks = (
  rows: unknown,
  issues: ConversionIssues,
): ConvertedBlock[] =>
  asArray(rows).flatMap((row) =>
    asArray(isObj(row) ? row.cells : undefined).flatMap((cell) =>
      cellToBlocks(cell, issues),
    ),
  );

const isEmptyParagraph = (b: ConvertedBlock): boolean =>
  b.type === "paragraph" &&
  b.children.length === 0 &&
  b.content.every((c) => isObj(c) && asString(c.text)?.trim() === "");

const finalize = (
  blocks: ConvertedBlock[],
  issues: ConversionIssues,
): SlateConversion => {
  if (issues.unmapped.length > 0) {
    return { type: "failed", ...issues };
  }
  if (blocks.every(isEmptyParagraph)) {
    return { type: "empty", ...issues };
  }
  if (!Schema.is(BlockNoteDocument)(blocks)) {
    return {
      type: "failed",
      warnings: issues.warnings,
      unmapped: ["result is not a valid BlockNote document"],
    };
  }
  return { type: "converted", value: blocks, ...issues };
};

const fromPlainText = (text: string): ConvertedBlock[] =>
  text
    .split("\n")
    .map((line) =>
      textBlock(
        "paragraph",
        toText({ text: line }, { unmapped: [], warnings: [] }),
        undefined,
      ),
    );

/** `[{ type: "paragraph", content: "text" }]`, without ids nor props */
const isPartialParagraphs = (
  v: unknown[],
): v is { type: "paragraph"; content: string }[] =>
  v.every(
    (b) =>
      isObj(b) &&
      b.type === "paragraph" &&
      b.id === undefined &&
      typeof b.content === "string",
  );

export const slateToBlockNote = (value: unknown): SlateConversion => {
  const issues: ConversionIssues = { unmapped: [], warnings: [] };

  if (value === null || value === undefined) {
    return { type: "unchanged" };
  }

  if (typeof value === "string") {
    return finalize(fromPlainText(value), issues);
  }

  if (Array.isArray(value)) {
    if (value.length === 0 || Schema.is(BlockNoteDocument)(value)) {
      return { type: "unchanged" };
    }
    if (isPartialParagraphs(value)) {
      return finalize(
        value.flatMap((b) => fromPlainText(b.content)),
        issues,
      );
    }
    return { type: "failed", warnings: [], unmapped: ["unknown array"] };
  }

  if (isObj(value)) {
    if (Object.keys(value).length === 0) {
      return { type: "empty", ...issues };
    }
    if (Array.isArray(value.rows)) {
      return finalize(rowsToBlocks(value.rows, issues), issues);
    }
  }

  return { type: "failed", warnings: [], unmapped: ["unknown value"] };
};
