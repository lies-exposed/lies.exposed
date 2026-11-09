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
  // ZeroClaw adapter (WS7) — feature-flagged replacement for agent
  zeroclow: Schema.Struct({
    enabled: Schema.optional(Schema.Boolean),
    webhookUrl: Schema.optional(URL),
    agentId: Schema.optional(Schema.String),
  }).annotations({ title: "ZeroClawConfig" }),
}).annotations({
  title: "AIBotConfig",
});

export type AIBotConfig = typeof AIBotConfig.Encoded;
