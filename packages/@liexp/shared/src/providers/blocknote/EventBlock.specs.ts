import { type CustomBlockConfig } from "@blocknote/core";
import { EventType } from "../../io/http/Events/index.js";

const DEFAULT_ID = "missing-id";
const DEFAULT_TYPE = "missing-type";

export const eventBlockSpecs = {
  type: "event",
  propSchema: {
    id: {
      default: DEFAULT_ID,
    },
    type: {
      default: DEFAULT_TYPE as EventType | typeof DEFAULT_TYPE,
      values: [...EventType.members.map((v) => v.Type), DEFAULT_TYPE],
    },
  },
  content: "inline",
} satisfies CustomBlockConfig;

export type EventBlockSpecs = typeof eventBlockSpecs;
