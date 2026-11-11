import { type Messages } from "@langchain/langgraph";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { type APIError } from "@liexp/io/lib/http/Error/APIError.js";
import { toAPIError } from "@liexp/shared/lib/utils/APIError.utils.js";
import type { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import type { LoggerContext } from "../../context/logger.context.js";
import { type Agent } from "../../providers/ai/agent.factory.js";

/**
 * Pure function that classifies a stream chunk and returns the updated output.
 *
 * Handles three chunk types:
 * 1. Structured response — `chunk.generate_structured_response.structuredResponse`
 *    replaces the accumulated output.
 * 2. Agent chunk — `chunk.agent` is appended.
 * 3. Fallback — `chunk.content.messages` is appended (crashes if `content` is
 *    `undefined`, matching the original behaviour).
 */
export const processChunk = (chunk: unknown, current: string): string => {
  if (
    chunk !== null &&
    typeof chunk === "object" &&
    "generate_structured_response" in chunk &&
    chunk.generate_structured_response !== null &&
    typeof chunk.generate_structured_response === "object" &&
    "structuredResponse" in chunk.generate_structured_response
  ) {
    return JSON.stringify(
      chunk.generate_structured_response.structuredResponse,
    );
  }

  if (chunk !== null && typeof chunk === "object" && "agent" in chunk) {
    return current + JSON.stringify(chunk.agent);
  }

  return (
    current +
    JSON.stringify(
      (chunk as { content: { messages: unknown } }).content.messages,
    )
  );
};

/**
 * Accumulate chunks from a stream into a single output string.
 *
 * Wraps the entire `for await` loop in `fp.TE.tryCatch` so that any error
 * during streaming (network, model, parsing) is converted to an `APIError`.
 * Per-chunk debug logging is preserved for observability.
 */
const accumulateChunks = (
  rawOutput: AsyncIterable<unknown>,
  logger: LoggerContext["logger"],
): TaskEither<APIError, string> =>
  fp.TE.tryCatch(async () => {
    let output = "";
    for await (const chunk of rawOutput) {
      logger.debug.log("Received chunk %O", chunk);
      output = processChunk(chunk, output);
    }
    logger.debug.log("Output %s", output);
    return output;
  }, toAPIError);

const runRunnableSequence =
  <C extends LoggerContext = LoggerContext>(
    messages: Messages,
    chain: Agent,
    mode: "stream" | "invoke" = "stream",
  ): ReaderTaskEither<C, APIError, any> =>
  (ctx) => {
    ctx.logger.debug.log("Running sequence in mode %s", mode);

    if (mode === "stream") {
      return pipe(
        fp.TE.tryCatch(
          () =>
            chain.stream(
              { messages: messages },
              {
                configurable: {
                  thread_id: uuid(),
                },
              },
            ),
          toAPIError,
        ),
        fp.TE.chain((stream) => accumulateChunks(stream, ctx.logger)),
      );
    }

    return fp.TE.tryCatch(async () => {
      const result = await chain.invoke({ messages });
      const output = JSON.stringify(result.messages);
      ctx.logger.debug.log("Output %s", output);
      return output;
    }, toAPIError);
  };

export const runAgent = <R = string, C extends LoggerContext = LoggerContext>(
  inputs: Messages,
  chain: Agent,
  mode: "stream" | "invoke" = "stream",
): ReaderTaskEither<C, APIError, R> => {
  return runRunnableSequence(inputs, chain, mode);
};
