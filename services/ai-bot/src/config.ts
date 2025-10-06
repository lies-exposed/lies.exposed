import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { Schema } from "effect";

export const AIBotConfig = Schema.Struct({
  localAi: Schema.Struct({
    url: Schema.String,
    apiKey: Schema.String,
    timeout: Schema.UndefinedOr(Schema.Number),
    models: Schema.Union(
      Schema.partial(
        Schema.Struct({
          chat: Schema.String,
          agent: Schema.String,
          summarization: Schema.String,
          embeddings: Schema.String,
        }),
      ),
      Schema.Undefined,
    ),
  }),
  api: Schema.Struct({
    url: URL,
    mcp: URL,
  }),
}).annotations({
  title: "AIBotConfig",
});

export type AIBotConfig = typeof AIBotConfig.Encoded;
