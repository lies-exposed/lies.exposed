import { type AnnotationRoot, type Messages } from "@langchain/langgraph";
import { fp } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  toAPIError,
  type APIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import type { ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type AgentMiddleware, type ReactAgent } from "langchain";
import type { LoggerContext } from "../../context/logger.context.js";

const runRunnableSequence =
  <C extends LoggerContext = LoggerContext>(
    inputs: Messages,
    chain: ReactAgent<
      Record<string, any>,
      AnnotationRoot<any> | undefined,
      AnnotationRoot<any>,
      readonly AgentMiddleware<any, any, any>[]
    >,
    mode: "stream" | "invoke" = "stream",
  ): ReaderTaskEither<C, APIError, any> =>
  (ctx) => {
    return fp.TE.tryCatch(async () => {
      ctx.logger.debug.log("Running sequence in mode %s", mode);

      let output;
      if (mode === "stream") {
        const stream = await chain.stream(
          { messages: inputs },
          {
            configurable: {
              thread_id: uuid(),
            },
          },
        );

        for await (const chunk of stream) {
          ctx.logger.debug.log("Received chunk %O", chunk);
          if (
            "generate_structured_response" in chunk &&
            "structuredResponse" in chunk.generate_structured_response
          ) {
            output = chunk.generate_structured_response.structuredResponse;
            continue;
          } else if ("agent" in chunk) {
            output = chunk.agent;
            continue;
          }
          output ??= "";
          output += chunk;
        }
      } else {
        output = await chain.invoke({ messages: inputs });
      }

      ctx.logger.debug.log("Output %s", output);

      return output;
    }, toAPIError);
  };

export const runAgent = <R = string, C extends LoggerContext = LoggerContext>(
  inputs: Messages,
  chain: ReactAgent<
    Record<string, any>,
    AnnotationRoot<any> | undefined,
    AnnotationRoot<any>,
    readonly AgentMiddleware<any, any, any>[]
  >,
  mode: "stream" | "invoke" = "stream",
): ReaderTaskEither<C, APIError, R> => {
  return runRunnableSequence(inputs, chain, mode);
};
