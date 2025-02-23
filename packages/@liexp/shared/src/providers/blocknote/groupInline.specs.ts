import { type InlineContentConfig } from "@blocknote/core";

export const groupInlineSpec = {
  type: "group",
  propSchema: {
    id: {
      default: "",
    },
    name: {
      default: "",
    },
    className: {
      default: "",
    },
    displayAvatar: {
      default: true,
    },
  },
  content: "none",
} satisfies InlineContentConfig;

export type GroupInlineSpec = typeof groupInlineSpec;
