import { type InlineContentConfig } from "@blocknote/core";

export const areaInlineSpec = {
  type: "area",
  propSchema: {
    id: {
      default: "",
    },
    className: {
      default: "",
    },
    displayLabel: {
      default: true,
    },
    displayFeaturedImage: {
      default: false,
    },
  },
  content: "none",
} satisfies InlineContentConfig;

export type AreaInlineSpec = typeof areaInlineSpec;
