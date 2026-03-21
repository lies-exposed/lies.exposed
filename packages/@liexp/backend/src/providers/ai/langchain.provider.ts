import { ChatAnthropic, type AnthropicInput } from "@langchain/anthropic";
import type { BaseMessageChunk } from "@langchain/core/messages";
import {
  ChatOpenAI,
  ChatOpenAICompletions,
  type ChatOpenAIFields,
  OpenAIEmbeddings,
} from "@langchain/openai";
import { ChatXAI, type ChatXAIInput } from "@langchain/xai";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { type AvailableModels } from "@liexp/io/lib/http/Chat.js";
import { type PromptFn } from "@liexp/shared/lib/providers/openai/prompts/prompt.type";
import type * as Reader from "fp-ts/lib/Reader.js";
import { type Document as LangchainDocument } from "langchain";
import type OpenAI from "openai";

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

/**
 * Extends ChatOpenAICompletions to capture `delta.reasoning` from LocalAI/Qwen3
 * thinking mode into `additional_kwargs.reasoning`. LangChain automatically
 * concatenates string values in additional_kwargs across streaming chunks,
 * so the full reasoning is assembled the same way as function_call.arguments.
 */
class ChatOpenAICompletionsWithThinking extends ChatOpenAICompletions {
  protected _convertCompletionsDeltaToBaseMessageChunk(
    delta: Record<string, any>,
    rawResponse: OpenAI.Chat.Completions.ChatCompletionChunk,
    defaultRole?: OpenAI.Chat.ChatCompletionRole,
  ): BaseMessageChunk {
    const chunk = super._convertCompletionsDeltaToBaseMessageChunk(
      delta,
      rawResponse,
      defaultRole,
    );
    const reasoning = delta.reasoning as string | undefined;
    if (reasoning) {
      chunk.additional_kwargs.reasoning = reasoning;
      // If content is empty, copy reasoning to content so LangGraph can process
      // the message (avoids "no action received" when the model puts its final
      // answer in delta.reasoning instead of delta.content after a tool call).
      // Wrap in <think> so supervisor parsing and the <think>-tag stream parser
      // can strip it out when extracting the actual final answer.
      if (
        chunk.content == null ||
        (typeof chunk.content === "string" && chunk.content === "")
      ) {
        chunk.content = `<think>${reasoning}</think>`;
      }
    }
    return chunk;
  }
}

const langchainLogger = GetLogger("langchain");

export const GetLangchainProvider = <P extends AIProvider>(
  opts: LangchainProviderOptions<P>,
): LangchainProvider<P> => {
  const defaultChatModel =
    opts.models?.chat ??
    (opts.provider === "anthropic" ? "claude-sonnet-4-20250514" : "gpt-4o");

  const logOptions = {
    ...opts,
    apiKey: opts.apiKey.substring(0, 3).concat(
      Array.from({ length: 16 })
        .flatMap(() => "*")
        .join(""),
    ),
  };

  langchainLogger.debug.log("Initializing Langchain provider...", logOptions);

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
      const openAIFields: ChatOpenAIFields = {
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
      };
      return new ChatOpenAI({
        ...openAIFields,
        completions: new ChatOpenAICompletionsWithThinking(openAIFields),
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

  const chat = makeChat(opts.provider, defaultChatModel);

  const embeddingsModel = opts.models?.embeddings ?? "text-embedding-ada-002";

  const embeddings = makeEmbedding(embeddingsModel);

  langchainLogger.info.log(
    "LangchainProvider initialized with chat model %s and embedding model %s",
    defaultChatModel,
    embeddingsModel,
  );

  return {
    options: opts,
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

      const chat = makeChat(logOptions.provider, chatModel);

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
