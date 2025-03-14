import * as t from "io-ts";

export const AIBotConfig = Schema.Struct(
  {
    localAi: Schema.Struct({
      url: Schema.String,
      apiKey: Schema.String,
      models: Schema.Union([
        t.partial({
          chat: Schema.String,
          summarization: Schema.String,
          embeddings: Schema.String,
        }),
        Schema.Undefined,
      ]),
    }),
    api: Schema.Struct({
      url: Schema.String,
    }),
  },
  "AIBotConfig",
);

export type AIBotConfig = t.TypeOf<typeof AIBotConfig>;
