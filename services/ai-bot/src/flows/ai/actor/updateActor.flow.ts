import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import {
  CreateQueueTextData,
  type CreateQueueEmbeddingTypeData,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { Schema } from "effect";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { loadDocs } from "../common/loadDocs.flow.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = (actorName: string) =>
  `Give me the requested info for actor ${actorName}. Return the response in JSON format with fields: firstName (string), lastName (string), username (string in lowercase format firstName-lastName), description (string), bornOn (string in ISO format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ), diedOn (string in ISO format or empty string if still alive), keywords (array of strings).`;

const ActorStructuredResponse = Schema.Struct({
  firstName: Schema.String,
  lastName: Schema.String,
  username: Schema.String.annotations({
    description:
      "The user's unique username (in the lowercase format of <firstName-lastName>)",
  }),
  description: Schema.String,
  bornOn: Schema.String.annotations({
    description:
      "Birth date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)",
  }),
  diedOn: Schema.String.annotations({
    description:
      "Death date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ), if applicable. Otherwise empty string.",
  }),
  keywords: Schema.Array(Schema.String),
}).annotations({ description: "Actor information in a structured format" });

type ActorStructuredResponse = typeof ActorStructuredResponse.Type;

export const updateActorFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  Omit<ActorStructuredResponse, "description"> & { excerpt: BlockNoteDocument }
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("actor", () =>
      pipe(
        fp.RTE.fromEither(
          Schema.decodeUnknownEither(CreateQueueTextData)(job.data),
        ),
        fp.RTE.mapLeft(toAIBotError),
        fp.RTE.map((actor) => actor.text),
      ),
    ),
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.bind("context", () => loadDocs(job)),
    fp.RTE.bind("result", ({ prompt, context }) =>
      pipe(
        AgentChatService.getStructuredOutput<
          ClientContext,
          ActorStructuredResponse
        >({
          message: `${prompt({
            vars: {
              text: context.map((doc) => doc.pageContent).join("\n"),
            },
          })}\n\n${
            job.question ??
            ("text" in job.data
              ? defaultQuestion(job.data.text)
              : "Extract the information from the text. Return in JSON format.")
          }`,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    LoggerService.RTE.debug("updateActorFlow output %O"),
    fp.RTE.map(({ result }) => ({
      excerpt: toInitialValue(result.description),
      firstName: result.firstName,
      lastName: result.lastName,
      username: result.username,
      bornOn: result.bornOn,
      diedOn: result.diedOn,
      keywords: result.keywords,
    })),
  );
};
