import { OpenAI, type ClientOptions } from "openai";

/**
 * Get OpenAI provider
 *
 * The base URL is set to the local development server,
 * so it can only works in the development environment.
 */
export const GetOpenAIProvider = (ctx: ClientOptions): OpenAI => {
  return new OpenAI({
    dangerouslyAllowBrowser: false,
    maxRetries: 0,
    timeout: 120 * 1000,
    ...ctx,
  });
};

export { type OpenAI };
