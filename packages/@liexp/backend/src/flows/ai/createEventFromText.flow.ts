import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { buildEvent } from "@liexp/shared/lib/helpers/event/event.js";
import { type EventCommonProps } from "@liexp/shared/lib/helpers/event/getCommonProps.helper.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type APIError,
  toAPIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import {
  type Event,
  type EventType,
} from "@liexp/shared/lib/io/http/Events/index.js";
import { type PromptFn } from "@liexp/shared/lib/io/openai/prompts/prompt.type.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { HumanMessage, SystemMessage, type Document } from "langchain";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type DBError } from "../../providers/orm/database.provider.js";
import { runAgent } from "./runRagChain.js";

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

export const createEventFromText = <C extends LoggerContext & LangchainContext>(
  text: Document[],
  type: EventType,
  promptTemplate: PromptFn<{
    jsonSchema: string;
    type: EventType;
    context: string;
    question: string;
  }>,
  jsonSchema: string,
  question: string,
): ReaderTaskEither<C, APIError | DBError, Event> => {
  return pipe(
    getCreateEventPromptPartial(promptTemplate, type),
    fp.RTE.chain((prompt) =>
      runAgent<EventCommonProps, C>(
        [new SystemMessage(prompt), new HumanMessage(question)],
        prompt,
      ),
    ),
    fp.RTE.chainEitherK((event) =>
      pipe(
        buildEvent(type, {
          ...event,
          actors: [],
          groups: [],
          areas: [],
          links: [],
          keywords: [],
          media: [],
          groupsMembers: [],
        }),
        fp.E.fromOption(() =>
          toAPIError(new Error("Cant't create event from response ")),
        ),
        fp.E.map(
          (ev) =>
            ({
              ...ev,
              id: uuid(),
              excerpt: null,
              body: null,
              keywords: [],
              links: [],
              media: [],
              socialPosts: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: undefined,
              draft: true,
            }) as Event,
        ),
      ),
    ),
  );
};
