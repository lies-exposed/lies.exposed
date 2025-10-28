import { runAgent } from "@liexp/backend/lib/flows/ai/runRagChain.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { effectToZodObject } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
import { toolStrategy } from "langchain";
import { type ClientContext } from "../../../context.js";
import { loadDocs } from "../common/loadDocs.flow.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = (actorName: string) =>
  `Give me the requested info for actor ${actorName}`;

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
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.bind("context", () => loadDocs(job)),
    fp.RTE.bind(
      "agent",
      () => (ctx: ClientContext) =>
        fp.TE.right(
          ctx.agent.createAgent({
            responseFormat: toolStrategy(
              effectToZodObject(ActorStructuredResponse.fields),
            ) as any,
          }),
        ),
    ),
    fp.RTE.chainW(({ prompt, context, agent }) =>
      runAgent<ActorStructuredResponse>(
        [
          {
            role: "system",
            content: prompt({
              vars: {
                text: context.map((doc) => doc.pageContent).join("\n"),
              },
            }),
          },
          {
            role: "user",
            content:
              job.question ??
              ("text" in job.data
                ? defaultQuestion(job.data.text)
                : "Extract the information from the text."),
          },
        ],
        agent,
      ),
    ),
    LoggerService.RTE.debug("updateActorFlow output %O"),
    fp.RTE.map(
      ({
        description,
        firstName,
        lastName,
        username,
        bornOn,
        diedOn,
        keywords,
      }) => ({
        excerpt: toInitialValue(description),
        firstName,
        lastName,
        username,
        bornOn,
        diedOn,
        keywords,
      }),
    ),
  );
};
