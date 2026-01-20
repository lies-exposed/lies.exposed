import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  toAPIError,
  type APIError,
} from "@liexp/io/lib/http/Error/APIError.js";
import { type EventType } from "@liexp/io/lib/http/Events/EventType.js";
import { type PromptFn } from "@liexp/io/lib/openai/prompts/prompt.type.js";
import { type AgentEndpoints } from "@liexp/shared/lib/endpoints/agent/index.js";
import { type EventCommonProps } from "@liexp/shared/lib/helpers/event/event.helper.js";
import { type API } from "@ts-endpoint/resource-client";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type Document } from "langchain";
import { type LangchainContext } from "../../context/langchain.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { AgentChatService } from "../../services/agent-chat/agent-chat.service.js";
import { getCreateEventPromptPartial } from "./createEventFromText.flow.js";

export const createEventFromDocuments = <
  C extends LangchainContext & LoggerContext & { agent: API<AgentEndpoints> },
>(
  documents: Document[],
  type: EventType,
  prompt: PromptFn<{
    type: EventType;
    jsonSchema: string;
    question: string;
    context: string;
  }>,
  jsonSchema: any,
  question: string,
): ReaderTaskEither<C, APIError, EventCommonProps> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("prompt", () => getCreateEventPromptPartial<C>(prompt, type)),
    fp.RTE.chain(({ prompt }) =>
      pipe(
        AgentChatService.getStructuredOutput<C, EventCommonProps>({
          message: `${prompt.toFormattedString()}\n\n${question}`,
          schema: jsonSchema,
        }),
        fp.RTE.mapLeft(toAPIError),
      ),
    ),
  );
};
