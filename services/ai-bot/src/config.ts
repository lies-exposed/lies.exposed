import * as t from "io-ts";

export const AIBotConfig = t.strict(
  {
    localAi: t.strict({
      url: t.string,
      apiKey: t.string,
      models: t.union([
        t.partial({
          summarization: t.string,
          embeddings: t.string,
        }),
        t.undefined,
      ]),
    }),
    api: t.strict({
      url: t.string,
    }),
  },
  "AIBotConfig",
);

export type AIBotConfig = t.TypeOf<typeof AIBotConfig>;
