import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Schema } from "effect";
import { toAIBotError } from "../../common/error/index.js";
import { type ClientContext } from "../../context.js";
import { type ClientContextRTE } from "../../types.js";

/**
 * Extended ChatMessage type with optional fields explicitly typed
 */
interface ChatMessageWithStructuredOutput {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: string;
  tool_calls?: {
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }[];
  tool_call_id?: string;
  structured_output?: unknown;
  response_metadata?: {
    model?: string;
    finish_reason?: string;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
}

/**
 * Options for structured output requests
 */
export interface StructuredOutputOptions<T> {
  /**
   * The message to send to the agent
   */
  message: string;
  /**
   * Optional conversation ID for context
   */
  conversationId?: string | null;
  /**
   * Optional schema for validation (currently used for documentation only)
   */
  schema?: Schema.Schema<T, unknown, never>;
  /**
   * Optional flag to extract JSON from markdown code blocks
   * @default false
   */
  extractFromMarkdown?: boolean;
  /**
   * Optional custom parser for the response
   */
  customParser?: (content: string, structuredOutput?: unknown) => T;
}

/**
 * Extracts JSON from markdown code blocks
 */
const extractJsonFromMarkdown = (content: string): string => {
  const jsonExecResult = /```json\s*([\s\S]*?)\s*```/.exec(content);
  if (jsonExecResult) {
    return jsonExecResult[1];
  }

  const codeBlockExecResult = /```\s*([\s\S]*?)\s*```/.exec(content);
  if (codeBlockExecResult) {
    return codeBlockExecResult[1];
  }

  return content;
};

/**
 * Default parser that tries structured_output first, then parses content as JSON
 */
const defaultParser = <T>(
  content: string,
  structuredOutput: unknown,
  extractFromMarkdown: boolean,
): T => {
  // Use structured_output from agent response if available
  if (structuredOutput !== undefined && structuredOutput !== null) {
    return structuredOutput as T;
  }

  // Fallback: parse content as JSON
  const jsonStr = extractFromMarkdown
    ? extractJsonFromMarkdown(content)
    : content;

  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    throw new Error(
      `Agent response missing structured_output and content is not valid JSON: ${e}`,
    );
  }
};

/**
 * Service for making agent chat requests with structured output parsing
 */
export const AgentChatService = {
  /**
   * Makes a chat request and returns structured output
   *
   * @template T - The expected type of the structured output
   * @param options - Configuration for the request
   * @returns A ReaderTaskEither that resolves to the parsed structured output
   *
   * @example
   * ```typescript
   * const ActorSchema = Schema.Struct({
   *   firstName: Schema.String,
   *   lastName: Schema.String,
   * });
   *
   * type ActorData = typeof ActorSchema.Type;
   *
   * const result = pipe(
   *   AgentChatService.getStructuredOutput<ActorData>({
   *     message: "Extract actor information from the text",
   *     schema: ActorSchema,
   *   }),
   *   fp.RTE.map((data) => {
   *     console.log(data.firstName, data.lastName);
   *     return data;
   *   })
   * );
   * ```
   */
  getStructuredOutput: <T>(
    options: StructuredOutputOptions<T>,
  ): ClientContextRTE<T> => {
    return (ctx: ClientContext) =>
      pipe(
        ctx.agent.Chat.Create({
          Body: {
            message: options.message,
            conversation_id: options.conversationId ?? null,
          },
        }),
        fp.TE.chainEitherK((response) => {
          const message = response.data
            .message as ChatMessageWithStructuredOutput;

          ctx.logger.debug.log(
            "AgentChatService structured output response: %O",
            {
              role: message.role,
              hasStructuredOutput: !!message.structured_output,
              contentPreview: message.content.substring(0, 100),
            },
          );

          try {
            const parsed = options.customParser
              ? options.customParser(message.content, message.structured_output)
              : defaultParser<T>(
                  message.content,
                  message.structured_output,
                  options.extractFromMarkdown ?? false,
                );

            ctx.logger.debug.log(
              "AgentChatService successfully parsed response",
            );
            return fp.E.right(parsed);
          } catch (e) {
            ctx.logger.error.log("AgentChatService parsing failed: %O", e);
            return fp.E.left(
              e instanceof Error
                ? e
                : new Error(`Failed to parse response: ${e}`),
            );
          }
        }),
        fp.TE.mapLeft(toAIBotError),
      );
  },

  /**
   * Makes a chat request and returns raw string output
   *
   * @param options - Configuration for the request
   * @returns A ReaderTaskEither that resolves to the raw message content
   *
   * @example
   * ```typescript
   * const result = pipe(
   *   AgentChatService.getRawOutput({
   *     message: "Summarize this text: ...",
   *   }),
   *   fp.RTE.map((content) => {
   *     console.log("Summary:", content);
   *     return content;
   *   })
   * );
   * ```
   */
  getRawOutput: (options: {
    message: string;
    conversationId?: string | null;
  }): ClientContextRTE<string> => {
    return (ctx: ClientContext) =>
      pipe(
        ctx.agent.Chat.Create({
          Body: {
            message: options.message,
            conversation_id: options.conversationId ?? null,
          },
        }),
        fp.TE.map((response) => {
          const message = response.data.message;

          ctx.logger.debug.log("AgentChatService raw output response: %O", {
            role: message.role,
            contentLength: message.content.length,
          });

          return message.content;
        }),
        fp.TE.mapLeft(toAIBotError),
      );
  },

  /**
   * Utility method to create a structured output request with logging
   *
   * @template T - The expected type of the structured output
   * @param flowName - Name of the flow for logging purposes
   * @param options - Configuration for the request
   * @returns A ReaderTaskEither that resolves to the parsed structured output
   */
  getStructuredOutputWithLogging: <T>(
    flowName: string,
    options: StructuredOutputOptions<T>,
  ): ClientContextRTE<T> => {
    return pipe(
      fp.RTE.Do,
      LoggerService.RTE.debug(`${flowName}: making request`),
      fp.RTE.chain(() => AgentChatService.getStructuredOutput<T>(options)),
      LoggerService.RTE.debug(`${flowName}: received response %O`),
    );
  },
};
