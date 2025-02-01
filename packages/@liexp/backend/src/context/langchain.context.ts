import { type LangchainProvider } from "../providers/ai/langchain.provider.js";

export interface LangchainContext {
  langchain: LangchainProvider;
}
