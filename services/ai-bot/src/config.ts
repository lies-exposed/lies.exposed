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
          summarization: Schema.String,
          embeddings: Schema.String,
        }),
      ),
      Schema.Undefined,
    ),
  }),
  api: Schema.Struct({
    url: Schema.String,
  }),
}).annotations({
  title: "AIBotConfig",
});

export type AIBotConfig = typeof AIBotConfig.Encoded;
