import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type EventCommonProps } from "@liexp/shared/lib/helpers/event/getCommonProps.helper.js";
import {
  toAPIError,
  type APIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type PromptFn } from "@liexp/shared/lib/io/openai/prompts/prompt.type.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { HumanMessage, SystemMessage } from "langchain";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { getCreateEventPromptPartial } from "./createEventFromText.flow.js";

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
    fp.RTE.chainW(
      ({ prompt }) =>
        (ctx: C) =>
          fp.TE.tryCatch(async () => {
            const messages = [
              new SystemMessage(prompt),
              new HumanMessage(question),
            ];

            ctx.logger.debug.log(
              "Invoking chat model with messages %O",
              messages,
            );
            const response = await ctx.langchain.chat.invoke(messages);

            ctx.logger.debug.log("Chat model response %O", response);

            // Parse the response content as JSON
            const content =
              typeof response.content === "string"
                ? response.content
                : JSON.stringify(response.content);

            return JSON.parse(content) as EventCommonProps;
          }, toAPIError),
    ),
  );
};
