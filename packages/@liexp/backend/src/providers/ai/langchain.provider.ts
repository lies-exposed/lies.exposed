import {
  ChatOpenAI,
  type ChatOpenAIFields,
  OpenAIEmbeddings,
} from "@langchain/openai";
import { ChatXAI, type ChatXAIInput } from "@langchain/xai";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { type PromptFn } from "@liexp/shared/lib/io/openai/prompts/prompt.type.js";
import { Schema } from "effect/index";
import type * as Reader from "fp-ts/lib/Reader.js";
import { type Document as LangchainDocument } from "langchain";

export const EMBEDDINGS_PROMPT: PromptFn<{
  text: string;
  question: string;
}> = ({
  vars: { text, question },
}) => `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know.
Use 300 chars maximum and keep the answers concise.

---
${text}
---

Question: ${question}

Answer:
`;

export const AvailableModels = Schema.Union(
  Schema.Literal("gpt-4o"),
  Schema.Literal("qwen3-4b"),
  Schema.Literal("qwen3-embedding-4b"),
  Schema.Literal("grok-4-fast"),
);

export type AvailableModels = typeof AvailableModels.Type;

export interface LangchainProviderOptions<Provider extends "openai" | "xai"> {
  baseURL: string;
  apiKey: string;
  maxRetries?: number;
  provider: Provider;
  models?: {
    chat?: AvailableModels;
    embeddings?: AvailableModels;
  };
  options?: {
    chat: ChatOpenAIFields;
    embeddings: NonNullable<ConstructorParameters<typeof OpenAIEmbeddings>[0]>;
  };
}

export interface LangchainProvider<Provider extends "openai" | "xai"> {
  readonly options: LangchainProviderOptions<Provider>;
  chat: Provider extends "openai" ? ChatOpenAI : ChatXAI;
  embeddings: OpenAIEmbeddings;
  queryDocument: <Args extends { text: string; question?: string }>(
    docs: LangchainDocument[],
    question: string,
    options?: { model?: AvailableModels; prompt?: PromptFn<Args> },
  ) => Promise<string>;
}

const langchainLogger = GetLogger("langchain");

export const GetLangchainProvider = <P extends "openai" | "xai">(
  opts: LangchainProviderOptions<P>,
): LangchainProvider<P> => {
  const defaultChatModel = opts.models?.chat ?? "gpt-4o";

  const options = {
    ...opts,
  };

  langchainLogger.debug.log("Initializing Langchain provider...", opts);

  const makeChat = <P extends "openai" | "xai">(
    provider: P,
    model: string,
    chatOptions: P extends "openai" ? ChatOpenAIFields : ChatXAIInput = {},
  ): P extends "openai" ? ChatOpenAI : ChatXAI => {
    if (provider === "openai") {
      const openAIChatOptions = chatOptions as ChatOpenAIFields;
      return new ChatOpenAI({
        model,
        temperature: 0,
        apiKey: opts.apiKey,
        timeout: 60 * 30 * 1000, // 30 minutes
        streaming: true,
        streamUsage: true,
        ...opts.options?.chat,
        ...chatOptions,
        configuration: {
          maxRetries: opts.maxRetries ?? 3,
          baseURL: opts.baseURL,
          ...opts.options?.chat.configuration,
          ...openAIChatOptions.configuration,
        },
      }) as P extends "openai" ? ChatOpenAI : ChatXAI;
    }

    return new ChatXAI({
      model,
      apiKey: opts.apiKey,
      ...chatOptions,
      ...opts.options?.chat,
    }) as P extends "openai" ? ChatOpenAI : ChatXAI;
  };

  const makeEmbedding = (
    model: string,
    embeddingOpts: ConstructorParameters<typeof OpenAIEmbeddings>[0] = {},
  ): OpenAIEmbeddings => {
    return new OpenAIEmbeddings({
      model,
      modelName: model,
      apiKey: opts.apiKey,
      timeout: 60 * 60 * 1000, // 1h,
      ...opts.options?.embeddings,
      ...embeddingOpts,
      configuration: {
        baseURL: opts.baseURL,
        ...opts.options?.embeddings.configuration,
        ...embeddingOpts?.configuration,
      },
    });
  };

  const chat = makeChat(options.provider, defaultChatModel);

  const embeddingsModel = opts.models?.embeddings ?? "text-embedding-ada-002";

  const embeddings = makeEmbedding(embeddingsModel);

  langchainLogger.info.log(
    "LangchainProvider initialized with chat model %s and embedding model %s",
    defaultChatModel,
    embeddingsModel,
  );

  return {
    options,
    chat,
    embeddings,
    queryDocument: async (content, question, opts) => {
      const model = opts?.model ?? embeddingsModel;

      const chatModel = opts?.model ?? defaultChatModel;

      langchainLogger.info.log(
        "queryDocument use embedding model %s to query document with size %d using chat model %s",
        model,
        content.length,
        chatModel,
      );

      const chat = makeChat(options.provider, chatModel);

      const stream = await chat.stream(question);

      let output = "";
      for await (const chunk of stream) {
        output += (chunk.content as string) ?? "";
      }

      return output;
    },
  };
};

export type LangchainProviderReader<P extends "openai" | "xai"> = Reader.Reader<
  LangchainProviderOptions<P>,
  LangchainProvider<P>
>;

export type { LangchainDocument };
