import { URL } from "@liexp/io/lib/http/Common/URL.js";
import { Schema } from "effect";

export const AIBotConfig = Schema.Struct({
  api: Schema.Struct({
    url: URL,
    mcp: URL,
  }),
  agent: Schema.Struct({
    url: URL,
  }),
}).annotations({
  title: "AIBotConfig",
});

export type AIBotConfig = typeof AIBotConfig.Encoded;
