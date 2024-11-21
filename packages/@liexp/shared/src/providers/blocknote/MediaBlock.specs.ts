import { type CustomBlockConfig } from "@blocknote/core";

export const DEFAULT_ID = "missing-id";

export const mediaBlockSpecs = {
  type: "media",
  propSchema: {
    id: {
      default: DEFAULT_ID,
    },
    enableDescription: {
      default: false,
    },
    height: {
      default: 150,
    },
  },
  content: "inline",
} satisfies CustomBlockConfig;

export type MediaBlockSpecs = typeof mediaBlockSpecs;
