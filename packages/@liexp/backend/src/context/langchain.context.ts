import { type LangchainProvider } from "../providers/ai/langchain.provider.js";

export interface LangchainContext<
  P extends "openai" | "xai" = "openai" | "xai",
> {
  /**
   * Langchain provider
   *
   * @description This is the provider that will be used to interact with Langchain.
   */
  langchain: LangchainProvider<P>;
}
