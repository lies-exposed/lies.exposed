import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type EventCommonProps } from "@liexp/shared/lib/helpers/event/getCommonProps.helper.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type PromptFn } from "@liexp/shared/lib/io/openai/prompts/prompt.type.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { createAgent, HumanMessage, SystemMessage } from "langchain";
import { z } from "zod";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { getCreateEventPromptPartial } from "./createEventFromText.flow.js";
import { runAgent } from "./runRagChain.js";

export const updateEventFromDocuments = <
  C extends LangchainContext & LoggerContext,
>(
  type: EventType,
  prompt: PromptFn<{
    type: EventType;
    jsonSchema: string;
    question: string;
    context: string;
  }>,
  question: string,
): ReaderTaskEither<C, APIError, EventCommonProps> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("prompt", () => getCreateEventPromptPartial<C>(prompt, type)),
    fp.RTE.bind(
      "model",
      () => (ctx) =>
        fp.TE.right(
          ctx.langchain.chat.withConfig({
            response_format: {
              type: "json_object",
            },
          }),
        ),
    ),
    fp.RTE.chain(({ prompt, model }) => {
      return runAgent<EventCommonProps, C>(
        [new SystemMessage(prompt), new HumanMessage(question)],
        createAgent({ model, responseFormat: z.object({}) }),
      );
    }),
  );
};
