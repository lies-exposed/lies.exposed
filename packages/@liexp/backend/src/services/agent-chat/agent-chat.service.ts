import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type AgentType } from "@liexp/io/lib/http/Chat.js";
import { type AgentEndpoints } from "@liexp/shared/lib/endpoints/agent/index.js";
import { type API } from "@ts-endpoint/resource-client";
import { JSONSchema, ParseResult, Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { ServerError } from "../../errors/index.js";
import { LoggerService } from "../logger/logger.service.js";

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
interface StructuredOutputOptions<T> {
  /**
   * The message to send to the agent
   */
  message: string;
  /**
   * Optional conversation ID for context
   */
  conversationId?: string | null;
  /**
   * Optional model override for the AI request
   */
  model?: string | null;
  /**
   * Optional specialized agent to run the request with (e.g. "researcher"
   * for web-verified answers). Defaults to the agent service default.
   */
  agentType?: AgentType;
  /**
   * Optional schema. When provided it is sent to the agent as a JSON schema
   * (`output_schema`) so the final answer is produced via structured output,
   * and the parsed response is decoded with it: a response that does not
   * match fails the request instead of propagating malformed data.
   */
  schema?: Schema.Schema<T, any, never>; // eslint-disable-line @typescript-eslint/no-explicit-any
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
export const extractJsonFromMarkdown = (content: string): string => {
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
 * Builds the JSON schema sent to the agent. Returns undefined for schemas
 * that cannot be represented (e.g. declarations without JSON annotations).
 */
export const toOutputJSONSchema = (
  schema: Schema.Schema<any, any, never>, // eslint-disable-line @typescript-eslint/no-explicit-any
): Record<string, unknown> | undefined => {
  try {
    const { $schema: _ignored, ...jsonSchema } = JSONSchema.make(
      schema,
    ) as unknown as { $schema?: string } & Record<string, unknown>;
    return jsonSchema;
  } catch {
    return undefined;
  }
};

/**
 * Default parser that tries structured_output first, then parses content as JSON
 */
export const defaultParser = <T>(
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
      { cause: e },
    );
  }
};

/**
 * Service for making agent chat requests with structured output parsing
 */
export interface AgentChatServiceTestContext {
  logger: LoggerContext;
  agent: {
    Chat: {
      Create: () => TaskEither<any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    };
  };
}

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
  getStructuredOutput: <
    C extends LoggerContext & { agent: API<AgentEndpoints> },
    T,
  >(
    options: StructuredOutputOptions<T>,
  ): ReaderTaskEither<C, ServerError, T> => {
    return (ctx) =>
      pipe(
        ctx.agent.Chat.Create({
          Body: {
            message: options.message,
            conversation_id: options.conversationId ?? null,
            model: options.model ?? undefined,
            agent_type: options.agentType,
            output_schema: options.schema
              ? toOutputJSONSchema(options.schema)
              : undefined,
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
                  options.extractFromMarkdown ?? true,
                );

            if (options.schema) {
              const decoded = Schema.decodeUnknownEither(options.schema)(
                parsed,
              );
              if (decoded._tag === "Left") {
                const issues = ParseResult.TreeFormatter.formatErrorSync(
                  decoded.left,
                );
                ctx.logger.error.log(
                  "AgentChatService response does not match schema: %s",
                  issues,
                );
                return fp.E.left(
                  new Error(
                    `Agent response does not match the expected schema: ${issues}`,
                  ),
                );
              }
              ctx.logger.debug.log(
                "AgentChatService successfully parsed and decoded response",
              );
              return fp.E.right(decoded.right);
            }

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
        fp.TE.mapLeft(ServerError.fromUnknown),
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
  getRawOutput: <
    C extends LoggerContext & { agent: API<AgentEndpoints> },
  >(options: {
    message: string;
    conversationId?: string | null;
  }): ReaderTaskEither<C, ServerError, string> => {
    return (ctx) =>
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
        fp.TE.mapLeft(ServerError.fromUnknown),
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
  getStructuredOutputWithLogging: <
    C extends LoggerContext & { agent: API<AgentEndpoints> },
    T,
  >(
    flowName: string,
    options: StructuredOutputOptions<T>,
  ): ReaderTaskEither<C, ServerError, T> => {
    return pipe(
      fp.RTE.Do,
      LoggerService.RTE.debug(`${flowName}: making request`),
      fp.RTE.chain(() => AgentChatService.getStructuredOutput<C, T>(options)),
      LoggerService.RTE.debug(`${flowName}: received response %O`),
    );
  },
};
