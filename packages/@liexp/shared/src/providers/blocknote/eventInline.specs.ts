import { type InlineContentConfig } from "@blocknote/core";

export const DEFAULT_EVENT_INLINE_ID = "missing-id";

export const eventInlineSpec = {
  type: "event-inline",
  propSchema: {
    id: {
      default: DEFAULT_EVENT_INLINE_ID,
    },
    title: {
      default: "",
    },
  },
  content: "none",
} satisfies InlineContentConfig;

export type EventInlineSpec = typeof eventInlineSpec;
