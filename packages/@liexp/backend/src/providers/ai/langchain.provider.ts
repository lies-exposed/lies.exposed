import { ChatAnthropic, type AnthropicInput } from "@langchain/anthropic";
import {
  ChatOpenAI,
  type ChatOpenAIFields,
  OpenAIEmbeddings,
} from "@langchain/openai";
import { ChatXAI, type ChatXAIInput } from "@langchain/xai";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { type PromptFn } from "@liexp/shared/lib/providers/openai/prompts/prompt.type";
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
  // OpenAI models
  Schema.Literal("gpt-4o"),
  // Local AI models
  Schema.Literal("qwen3-4b"),
  Schema.Literal("qwen3-embedding-4b"),
  // XAI models
  Schema.Literal("grok-4-fast"),
  // Anthropic Claude models
  Schema.Literal("claude-sonnet-4-20250514"),
  Schema.Literal("claude-3-7-sonnet-latest"),
  Schema.Literal("claude-3-5-haiku-latest"),
);

export type AvailableModels = typeof AvailableModels.Type;

export type AIProvider = "openai" | "xai" | "anthropic";

export interface LangchainProviderOptions<Provider extends AIProvider> {
  baseURL: string;
  apiKey: string;
  maxRetries?: number;
  provider: Provider;
  models?: {
    chat?: AvailableModels;
    embeddings?: AvailableModels;
  };
  options?: {
    chat: Provider extends "anthropic"
      ? AnthropicInput
      : Provider extends "xai"
        ? ChatXAIInput
        : ChatOpenAIFields;
    embeddings: NonNullable<ConstructorParameters<typeof OpenAIEmbeddings>[0]>;
  };
}

export type ChatModel<Provider extends AIProvider> =
  Provider extends "anthropic"
    ? ChatAnthropic
    : Provider extends "xai"
      ? ChatXAI
      : ChatOpenAI;

export interface LangchainProvider<Provider extends AIProvider> {
  readonly options: LangchainProviderOptions<Provider>;
  chat: ChatModel<Provider>;
  embeddings: OpenAIEmbeddings;
  queryDocument: <Args extends { text: string; question?: string }>(
    docs: LangchainDocument[],
    question: string,
    options?: { model?: AvailableModels; prompt?: PromptFn<Args> },
  ) => Promise<string>;
}

const langchainLogger = GetLogger("langchain");

export const GetLangchainProvider = <P extends AIProvider>(
  opts: LangchainProviderOptions<P>,
): LangchainProvider<P> => {
  const defaultChatModel =
    opts.models?.chat ??
    (opts.provider === "anthropic" ? "claude-sonnet-4-20250514" : "gpt-4o");

  const options = {
    ...opts,
  };

  langchainLogger.debug.log("Initializing Langchain provider...", opts);

  const makeChat = <P extends AIProvider>(
    provider: P,
    model: string,
    chatOptions: Record<string, unknown> = {},
  ): ChatModel<P> => {
    if (provider === "anthropic") {
      const anthropicChatOpts = (opts.options?.chat ?? {}) as AnthropicInput;
      return new ChatAnthropic({
        model,
        temperature: 0,
        anthropicApiKey: opts.apiKey,
        maxRetries: opts.maxRetries ?? 3,
        streaming: true,
        ...anthropicChatOpts,
        ...chatOptions,
      }) as ChatModel<P>;
    }

    if (provider === "openai") {
      const openAIChatOpts = (opts.options?.chat ?? {}) as ChatOpenAIFields;
      const openAIChatOptions = chatOptions as ChatOpenAIFields;
      return new ChatOpenAI({
        model,
        temperature: 0,
        apiKey: opts.apiKey,
        timeout: 60 * 30 * 1000, // 30 minutes
        streaming: true,
        streamUsage: true,
        ...openAIChatOpts,
        ...openAIChatOptions,
        configuration: {
          maxRetries: opts.maxRetries ?? 3,
          baseURL: opts.baseURL,
          ...openAIChatOpts.configuration,
          ...openAIChatOptions.configuration,
        },
      }) as ChatModel<P>;
    }

    // XAI provider
    const xaiChatOpts = (opts.options?.chat ?? {}) as ChatXAIInput;
    return new ChatXAI({
      model,
      ...xaiChatOpts,
      ...chatOptions,
      apiKey: opts.apiKey,
    }) as ChatModel<P>;
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

export type LangchainProviderReader<P extends AIProvider> = Reader.Reader<
  LangchainProviderOptions<P>,
  LangchainProvider<P>
>;

export type { LangchainDocument };
