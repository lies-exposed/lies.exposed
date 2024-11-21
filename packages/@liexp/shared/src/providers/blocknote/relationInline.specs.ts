import { type InlineContentConfig } from "@blocknote/core";

export const relationInlineSpec = {
  type: "relation",
  propSchema: {
    relation: {
      default: undefined as any as string,
    },
    id: {
      default: undefined as any as string,
    },
  },
  content: "none",
} satisfies InlineContentConfig;

export type RelationInlineSpec = typeof relationInlineSpec;
