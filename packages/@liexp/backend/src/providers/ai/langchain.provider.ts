import { ChatAnthropic, type AnthropicInput } from "@langchain/anthropic";
import { type CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { type BaseMessage } from "@langchain/core/messages";
import { type ChatResult } from "@langchain/core/outputs";
import {
  ChatOpenAI,
  type ChatOpenAIFields,
  OpenAIEmbeddings,
} from "@langchain/openai";
import { ChatXAI, type ChatXAIInput } from "@langchain/xai";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { type AvailableModels } from "@liexp/io/lib/http/Chat.js";
import { type PromptFn } from "@liexp/shared/lib/providers/openai/prompts/prompt.type.js";
import type * as Reader from "fp-ts/lib/Reader.js";
import { type Document as LangchainDocument } from "langchain";

const langchainLogger = GetLogger("langchain");

const EMPTY_CHOICES_MAX_RETRIES = 2;

/**
 * Some OpenAI-compatible backends (observed with LocalAI serving
 * qwen3.6-35b-a3b) occasionally answer a non-streaming completion with
 * HTTP 200 and an empty/missing `choices` array — no exception is thrown,
 * so @langchain/openai's completions.js silently returns `generations: []`,
 * and @langchain/core's BaseChatModel.invoke() then crashes reading
 * `.generations[0][0].message` of undefined. This isn't a network failure,
 * so ChatOpenAI's own `maxRetries` never kicks in. Retry the underlying
 * completion ourselves when this happens before giving up.
 */
class ChatOpenAIWithEmptyChoicesRetry extends ChatOpenAI {
  override async _generate(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun,
  ): Promise<ChatResult> {
    let result: ChatResult | undefined;
    for (let attempt = 1; attempt <= EMPTY_CHOICES_MAX_RETRIES + 1; attempt++) {
      result = await super._generate(messages, options, runManager);
      if (result.generations.length > 0) return result;
      langchainLogger.warn.log(
        "Chat completion returned no choices (attempt %d/%d) — backend likely had a transient hiccup%s",
        attempt,
        EMPTY_CHOICES_MAX_RETRIES + 1,
        attempt <= EMPTY_CHOICES_MAX_RETRIES ? ", retrying..." : "",
      );
    }
    throw new Error(
      `Chat completion backend returned no choices after ${EMPTY_CHOICES_MAX_RETRIES + 1} attempts`,
    );
  }
}

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

export type { AvailableModels };

export type AIProvider = "openai" | "xai" | "anthropic";

export interface LangchainProviderOptions<Provider extends AIProvider> {
  baseURL: string;
  apiKey: string;
  maxRetries?: number;
  provider: Provider;
  models?: {
    chat?: string;
    embeddings?: string;
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
    options?: { model?: string; prompt?: PromptFn<Args> },
  ) => Promise<string>;
}

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
      const openAIChat = new ChatOpenAIWithEmptyChoicesRetry({
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
      });
      // Some OpenAI-compatible backends (observed with LocalAI serving
      // qwen3.6-35b-a3b) mis-merge interleaved streaming chunks when the
      // model emits 2+ tool calls in one turn: additional_kwargs.tool_calls
      // ends up populated but the normalized top-level AIMessage.tool_calls
      // — the field LangGraph's routing condition actually checks — stays
      // empty, so the graph falls through to __end__ without ever invoking
      // a tool. Forcing one-tool-call-per-turn via parallel_tool_calls
      // sidesteps the chunk-merge bug entirely. withConfig (not bindTools,
      // which createAgent would reject as pre-bound tools) is preserved
      // because createAgent's own bindTools() merges config from an
      // existing RunnableBinding.
      return openAIChat.withConfig({
        parallel_tool_calls: false,
      }) as unknown as ChatModel<P>;
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
