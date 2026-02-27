import { type InlineContentConfig } from "@blocknote/core";

export const DEFAULT_LINK_ENTITY_ID = "missing-id";

export const linkEntityInlineSpec = {
  type: "link-entity",
  propSchema: {
    id: {
      default: DEFAULT_LINK_ENTITY_ID,
    },
    url: {
      default: "",
    },
    title: {
      default: "",
    },
  },
  content: "none",
} satisfies InlineContentConfig;

export type LinkEntityInlineSpec = typeof linkEntityInlineSpec;
