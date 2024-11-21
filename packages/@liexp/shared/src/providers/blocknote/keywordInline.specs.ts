import { type InlineContentConfig } from "@blocknote/core";

export const keywordInlineSpec = {
  type: "keyword",
  propSchema: {
    id: {
      default: "",
    },
  },
  content: "none",
} satisfies InlineContentConfig;

export type KeywordInlineSpec = typeof keywordInlineSpec;
