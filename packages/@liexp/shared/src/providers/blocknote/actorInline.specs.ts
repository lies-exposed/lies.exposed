import { type InlineContentConfig } from "@blocknote/core";

export const DEFAULT_ACTOR_ID = "missing-id";

export const actorInlineSpec = {
  type: "actor",
  propSchema: {
    id: {
      default: DEFAULT_ACTOR_ID,
    },
    fullName: {
      default: "",
    },
    className: {
      default: "",
    },
    displayAvatar: {
      default: true,
    },
    displayFullName: {
      default: true,
    },
  },
  content: "none",
} satisfies InlineContentConfig;

export type ActorInlineSpec = typeof actorInlineSpec;
