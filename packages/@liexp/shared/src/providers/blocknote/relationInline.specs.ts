import { type InlineContentConfig } from "@blocknote/core";

const DEFAULT_RELATION_ID = "missing-relation-id";

export const relationInlineSpec = {
  type: "relation",
  propSchema: {
    relation: {
      default: DEFAULT_RELATION_ID,
    },
    id: {
      default: DEFAULT_RELATION_ID,
    },
  },
  content: "none",
} satisfies InlineContentConfig;

export type RelationInlineSpec = typeof relationInlineSpec;
