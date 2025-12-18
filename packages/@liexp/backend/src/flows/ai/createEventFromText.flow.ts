import { fp } from "@liexp/core/lib/fp/index.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { type PromptFn } from "@liexp/shared/lib/io/openai/prompts/prompt.type.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { HumanMessage } from "langchain";
import { type LoggerContext } from "../../context/logger.context.js";

export const getCreateEventPromptPartial =
  <C extends LoggerContext>(
    promptTemplate: PromptFn<{
      type: EventType;
      jsonSchema: string;
      context: string;
      question: string;
    }>,
    type: EventType,
  ): ReaderTaskEither<C, APIError, HumanMessage> =>
  (ctx) => {
    return fp.TE.fromIO(() => {
      const template = promptTemplate({
        vars: {
          type,
          jsonSchema: "{jsonSchema}",
          question: "{question}",
          context: "{context}",
        },
      });

      ctx.logger.info.log(
        "Populating template with even type %s \n %s",
        type,
        template,
      );

      return new HumanMessage(template);
    });
  };
