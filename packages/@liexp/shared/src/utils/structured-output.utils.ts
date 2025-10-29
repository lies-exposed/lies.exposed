import { type Schema } from "effect";
import {
  providerStrategy,
  toolStrategy,
  type ProviderStrategy,
} from "langchain";
import { effectToZodObject } from "./schema.utils.js";

/**
 * Strategy type for structured output
 */
export type StructuredOutputStrategyType = "provider" | "tool";

/**
 * Options for tool strategy
 */
export interface ToolStrategyOptions {
  /**
   * Allows you to customize the message that appears in the conversation history when structured
   * output is generated.
   */
  toolMessageContent?: string;
  /**
   * Handle errors from the structured output tool call.
   * - `true` - retry the tool call
   * - `false` - throw an error
   * - `string` - retry the tool call with the provided message
   * - function - retry with the provided message or throw the error
   */
  handleError?: boolean | string | ((error: any) => Promise<string> | string);
}

/**
 * Creates a structured output strategy from an Effect Schema using providerStrategy.
 * This uses the provider's native structured output capabilities (like OpenAI's JSON mode).
 * May not be compatible with all providers (e.g., LocalAI through Ngrok).
 *
 * @param fields - Effect Schema fields to convert
 * @returns ProviderStrategy for structured output
 */
export const createProviderStrategy = <T extends Schema.Struct.Fields>(
  fields: T,
): ProviderStrategy<Schema.Struct.Type<T>> => {
  return providerStrategy(effectToZodObject(fields));
};

/**
 * Creates a structured output strategy from an Effect Schema using toolStrategy.
 * This uses function calling to generate structured output, which is more broadly compatible
 * across different providers and proxy configurations.
 *
 * @param fields - Effect Schema fields to convert
 * @param options - Optional tool strategy options
 * @returns ToolStrategy array for structured output
 */
export const createToolStrategy = <T extends Schema.Struct.Fields>(
  fields: T,
  options?: ToolStrategyOptions,
) => {
  return toolStrategy(effectToZodObject(fields), options);
};

/**
 * Creates a structured output strategy from an Effect Schema.
 * This is a convenience function that defaults to using toolStrategy (more compatible)
 * but can be configured to use providerStrategy if needed.
 *
 * @param fields - Effect Schema fields to convert
 * @param strategyType - Type of strategy to use ('tool' or 'provider'), defaults to 'tool'
 * @param options - Optional tool strategy options (only used for 'tool' strategy)
 * @returns Structured output strategy
 */
export const createStructuredOutputStrategy = <T extends Schema.Struct.Fields>(
  fields: T,
  strategyType: StructuredOutputStrategyType = "tool",
  options?: ToolStrategyOptions,
) => {
  if (strategyType === "provider") {
    return createProviderStrategy(fields);
  }
  return createToolStrategy(fields, options);
};


