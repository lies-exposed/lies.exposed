import {
  ChatOpenAI,
  type ChatOpenAIFields,
  OpenAIEmbeddings,
} from "@langchain/openai";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { type PromptFn } from "@liexp/shared/lib/io/openai/prompts/prompt.type.js";
import type * as Reader from "fp-ts/lib/Reader.js";
import {
  createAgent,
  type Document as LangchainDocument,
  type ReactAgent,
  summarizationMiddleware,
} from "langchain";

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

// const DEFAULT_SUMMARIZATION_QUESTION = "Can you summarize this article for me?";

export const DEFAULT_SUMMARIZE_PROMPT: PromptFn<{ text: string }> = ({
  vars: { text },
}) => `
You are an expert in summarizing texts. These texts can be either excerpt of web pages or articles.
Your goal is to create a summary of the given text, focusing on the actions made by the characters mentioned in the text.
Below you find the text you need to summarize.

--------
${text}
--------
`;

export type AvailableModels =
  | "gpt-4o"
  | "gpt-3.5-turbo"
  | "text-embedding-ada-002"
  | "salamandra-7b-instruct"
  | "qwen3-8b"
  | "qwen3-embedding-8b"
  | "gemma-2-9b-it-abliterated";

export interface LangchainProviderOptions {
  baseURL: string;
  apiKey: string;
  models?: {
    chat?: AvailableModels;
    embeddings?: AvailableModels;
  };
  options?: {
    chat: ChatOpenAIFields;
    embeddings: NonNullable<ConstructorParameters<typeof OpenAIEmbeddings>[0]>;
  };
}

export interface LangchainProvider {
  readonly options: LangchainProviderOptions;
  chat: ChatOpenAI;
  agent: ReactAgent;
  embeddings: OpenAIEmbeddings;
  queryDocument: <Args extends { text: string; question?: string }>(
    docs: LangchainDocument[],
    question: string,
    options?: { model?: AvailableModels; prompt?: PromptFn<Args> },
  ) => Promise<string>;
  summarizeText: <Args extends { text: string }>(
    text: LangchainDocument[],
    options?: {
      model?: AvailableModels;
      prompt?: PromptFn<Args>;
      question?: string;
    },
  ) => Promise<string>;
}

const langchainLogger = GetLogger("langchain");

export const GetLangchainProvider = (
  opts: LangchainProviderOptions,
): LangchainProvider => {
  const defaultChatModel = opts.models?.chat ?? "gpt-4o";

  const options = {
    ...opts,
  };

  const makeChat = (
    model: string,
    chatOptions: ChatOpenAIFields = {},
  ): ChatOpenAI => {
    const chat = new ChatOpenAI({
      model,
      temperature: 0,
      apiKey: opts.apiKey,
      timeout: 60 * 30 * 1000, // 30 minutes
      streaming: true,
      streamUsage: true,
      ...opts.options?.chat,
      ...chatOptions,
      configuration: {
        baseURL: opts.baseURL,
        ...opts.options?.chat.configuration,
        ...chatOptions.configuration,
      },
    });

    return chat;
  };

  const makeAgent = (chat: ChatOpenAI): ReactAgent => {
    return createAgent({
      model: chat,
      middleware: [
        summarizationMiddleware({ model: chat, maxTokensBeforeSummary: 50 }),
      ],
    });
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

  const chat = makeChat(defaultChatModel);
  const agent = makeAgent(chat);

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
    agent,
    embeddings,
    queryDocument: async (content, question, options) => {
      const model = options?.model ?? embeddingsModel;

      const chatModel = options?.model ?? defaultChatModel;

      langchainLogger.info.log(
        "queryDocument use embedding model %s to query document with size %d using chat model %s",
        model,
        content.length,
        chatModel,
      );

      const chat = makeChat(chatModel);

      const stream = await chat.stream(question);

      let output = "";
      for await (const chunk of stream) {
        output += chunk;
      }

      return output;
    },
    summarizeText: async (content, options) => {
      const model = options?.model ?? embeddingsModel;

      const chatModel = options?.model ?? defaultChatModel;

      langchainLogger.info.log(
        "summarizeText use embedding model %s to summarize text with size %d using chat model %s",
        model,
        content.length,
        chatModel,
      );

      const stream = await agent.stream({
        messages: [
          {
            role: "human",
            content: "Give me the summary of the following text",
          },
          {
            role: "human",
            content: content,
          },
        ],
      });

      let output = "";
      for await (const chunk of stream) {
        output += chunk;
      }

      return output;
    },
  };
};

export type LangchainProviderReader = Reader.Reader<
  LangchainProviderOptions,
  LangchainProvider
>;

export type { LangchainDocument };
