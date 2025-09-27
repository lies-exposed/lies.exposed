import { type CustomBlockConfig } from "@blocknote/core";
import { EventType } from "../../io/http/Events/index.js";

const DEFAULT_ID = "missing-id";
const DEFAULT_TYPE = "missing-type";

const propSchema = {
  id: {
    default: DEFAULT_ID,
  },
  type: {
    default: DEFAULT_TYPE as EventType | typeof DEFAULT_TYPE,
    values: [...EventType.members.map((v) => v.literals[0]), DEFAULT_TYPE],
  },
};

export const eventBlockSpecs = {
  type: "event",
  propSchema,
  content: "inline",
} satisfies CustomBlockConfig<string, typeof propSchema, "inline">;

export type EventBlockSpecs = typeof eventBlockSpecs;
