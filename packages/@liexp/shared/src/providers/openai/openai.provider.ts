import { OpenAI, type ClientOptions } from "openai";

/**
 * Get OpenAI provider
 *
 * The base URL is set to the local development server,
 * so it can only works in the development environment.
 */

export interface OpenAIProvider {
  client: OpenAI;
}
export const GetOpenAIProvider = (ctx: ClientOptions): OpenAIProvider => {
  const client = new OpenAI({
    dangerouslyAllowBrowser: false,
    timeout: 30 * 60_1000, // 30 minutes
    ...ctx,
  });

  return {
    client,
  };
};

export { type OpenAI };
