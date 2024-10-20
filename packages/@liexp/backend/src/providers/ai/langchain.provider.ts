import { type Document as LangchainDocument } from "@langchain/core/documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import * as Reader from "fp-ts/lib/Reader.js";
import { pipe } from "fp-ts/lib/function.js";
import { loadSummarizationChain } from "langchain/chains";
// import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { formatDocumentsAsString } from "langchain/util/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const embeddingsTemplate = `You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know.
Use three sentences maximum and keep the answer concise.

---
{context}
---

Question: {question}

Answer:
`;

const summaryTemplate = `
You are an expert in summarizing articles
Your goal is to create a summary of an article from the web.
Below you find the content of the article:
--------
{text}
--------

Please summarize the article in a max 300 characters

Summary:
`;

export interface LangchainProvider {
  chat: ChatOpenAI;
  embeddings: OpenAIEmbeddings;
  queryDocument: (
    url: LangchainDocument[],
    question: string,
  ) => Promise<string>;
  summarizeText: (text: LangchainDocument[]) => Promise<string>;
}

export interface LangchainProviderOptions {
  baseURL: string;
}
export const GetLangchainProvider = (
  opts: LangchainProviderOptions,
): LangchainProvider => {
  const chat = new ChatOpenAI({
    // model: "gpt-3.5-turbo",
    model: "gpt-4o",
    // model: "text-embedding-ada-002",
    // model: 'all-MiniLM-L6-v2',
    temperature: 0,
    apiKey: "no-key-is-a-good-key",
    configuration: {
      baseURL: opts.baseURL,
      apiKey: "no-key-is-a-good-key",
    },
    streaming: true,
  });

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-ada-002",
    apiKey: "no-key-is-a-good-key",
    configuration: {
      baseURL: opts.baseURL,
      apiKey: "no-key-is-a-good-key",
    },
  });

  return {
    chat,
    embeddings,
    queryDocument: async (content, question) => {
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
      const prompt = PromptTemplate.fromTemplate(embeddingsTemplate);

      // const ragChain = await createStuffDocumentsChain({
      //   llm: chat,
      //   prompt,
      //   outputParser: new StringOutputParser(),
      // });

      const ragChain = RunnableSequence.from([
        {
          context: retriever.pipe(formatDocumentsAsString),
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
    summarizeText: async (text) => {
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docsSummary = await textSplitter.splitDocuments(text);

      const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate);

      // const SUMMARY_REFINE_PROMPT = PromptTemplate.fromTemplate(
      //   summaryRefineTemplate,
      // );

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

export const LangchainProviderReader = pipe(
  Reader.ask<LangchainProviderOptions>(),
  Reader.map(GetLangchainProvider),
);
export type LangchainProviderReader = Reader.Reader<
  LangchainProviderOptions,
  LangchainProvider
>;

export type { LangchainDocument };
