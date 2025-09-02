import { type Document as LangchainDocument } from "@langchain/core/documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import {
  ChatOpenAI,
  type ChatOpenAIFields,
  OpenAIEmbeddings,
} from "@langchain/openai";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { type PromptFn } from "@liexp/shared/lib/io/openai/prompts/prompt.type.js";
import type * as Reader from "fp-ts/lib/Reader.js";
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { formatDocumentsAsString } from "langchain/util/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

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
  embeddings: OpenAIEmbeddings;
  queryDocument: <Args extends { text: string; question?: string }>(
    url: LangchainDocument[],
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
  const chatModel = opts.models?.chat ?? "gpt-4o";

  const options = {
    ...opts,
  };
  const chat = new ChatOpenAI({
    model: chatModel,
    temperature: 0,
    apiKey: opts.apiKey,
    timeout: 60 * 30 * 1000, // 30 minutes
    maxConcurrency: 1,
    maxRetries: 2,
    streamUsage: false,
    ...opts.options?.chat,
    configuration: {
      baseURL: opts.baseURL,
      ...opts.options?.chat?.configuration,
    },
  });

  const embeddingsModel = opts.models?.embeddings ?? "text-embedding-ada-002";

  const embeddings = new OpenAIEmbeddings({
    model: embeddingsModel,
    apiKey: opts.apiKey,
    timeout: 60 * 30 * 1000, // 30 minutes,
    ...opts.options?.embeddings,
    configuration: {
      baseURL: opts.baseURL,
      ...opts.options?.embeddings?.configuration,
    },
  });

  langchainLogger.info.log(
    "LangchainProvider initialized with chat model %s and embedding model %s",
    chatModel,
    embeddingsModel,
  );

  return {
    options,
    chat,
    embeddings,
    queryDocument: async (content, question, options) => {
      const model =
        options?.model ?? opts.models?.embeddings ?? "text-embedding-ada-002";

      const chatModel = options?.model ?? opts.models?.chat ?? "gpt-4o";

      langchainLogger.info.log(
        "queryDocument use embedding model %s to query document with size %d using chat model %s",
        model,
        content.length,
        chatModel,
      );

      const chat = new ChatOpenAI({
        model: chatModel,
        temperature: 0,
        apiKey: opts.apiKey,
        configuration: {
          baseURL: opts.baseURL,
          ...opts.options?.chat.configuration,
        },
        streaming: true,
      });

      const embeddings = new OpenAIEmbeddings({
        model,
        apiKey: opts.apiKey,
        timeout: 60 * 30 * 1000, // 30 minutes
        configuration: {
          baseURL: opts.baseURL,
          ...opts.options?.embeddings.configuration,
        },
      });

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splits = await textSplitter.splitDocuments(content);

      const vectorStore = await MemoryVectorStore.fromDocuments(
        splits,
        embeddings,
      );

      // Retrieve and generate using the relevant snippets of the blog.
      const retriever = vectorStore.asRetriever();

      const prompt = PromptTemplate.fromTemplate(
        EMBEDDINGS_PROMPT({ vars: { question: "{question}", text: "{text}" } }),
      );

      const ragChain = RunnableSequence.from([
        {
          text: retriever.pipe(formatDocumentsAsString),
          question: new RunnablePassthrough(),
        },
        prompt,
        chat,
        new StringOutputParser(),
      ]);

      const stream = await ragChain.stream(question);

      let output = "";
      for await (const chunk of stream) {
        output += chunk;
      }

      return output;
    },
    summarizeText: async <Args extends { text: string }>(
      text: LangchainDocument[],
      options?: {
        model?: AvailableModels;
        prompt?: PromptFn<Args>;
        question?: string;
      },
    ) => {
      const model = options?.model ?? opts.models?.chat ?? "gpt-4o";
      const prompt = options?.prompt ?? DEFAULT_SUMMARIZE_PROMPT;

      const chat = new ChatOpenAI({
        model,
        apiKey: opts.apiKey,
        temperature: 0,
        configuration: {
          baseURL: opts.baseURL,
        },
        streaming: true,
      });

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docsSummary = await textSplitter.splitDocuments(text);

      const SUMMARY_PROMPT = PromptTemplate.fromTemplate(
        prompt({
          vars: {
            text: docsSummary.flatMap((doc) => doc.pageContent).join("\n"),
          } as Args,
        }),
      );

      const summarizeChain = loadSummarizationChain(chat, {
        type: "stuff",
        verbose: true,
        prompt: SUMMARY_PROMPT,
      });

      const stream = await summarizeChain.stream({
        input_documents: docsSummary,
      });
      let output = "";
      for await (const chunk of stream) {
        // console.log('streaming', chunk.text);
        output += chunk.text;
      }
      // console.log('output', output);

      return output;
    },
  };
};

export type LangchainProviderReader = Reader.Reader<
  LangchainProviderOptions,
  LangchainProvider
>;

export type { LangchainDocument };
