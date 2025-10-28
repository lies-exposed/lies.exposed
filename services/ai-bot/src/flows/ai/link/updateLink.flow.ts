import { runAgent } from "@liexp/backend/lib/flows/ai/runRagChain.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { effectToZodObject } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
import { HumanMessage, SystemMessage, toolStrategy } from "langchain";
import { type ClientContext } from "../../../context.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = `Return the requested information in the requested format.`;

const UpdateLinkStructuredResponse = Schema.Struct({
  title: Schema.String.annotations({
    description: "The title of the link",
  }),
  description: Schema.String.annotations({
    description: "The description of the link",
  }),
  publishDate: Schema.String.annotations({
    description:
      "The date the content was published in ISO 8601 format (empty string if not published)",
  }),
});
export type UpdateLinkStructuredResponse =
  typeof UpdateLinkStructuredResponse.Type;

const UpdateLinkStructuredResponseSchema = effectToZodObject(
  UpdateLinkStructuredResponse.fields,
);

export const updateLinkFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  { title: string; description: string }
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.bind(
      "agent",
      () => (ctx: ClientContext) =>
        fp.TE.right(
          ctx.agent.createAgent({
            responseFormat: toolStrategy(
              UpdateLinkStructuredResponseSchema,
            ) as any,
          }),
        ),
    ),
    fp.RTE.chainW(({ prompt, agent }) =>
      runAgent<UpdateLinkStructuredResponse>(
        [
          new SystemMessage(
            prompt({
              vars: {
                text: (job.data as any).url,
              },
            }),
          ),
          new HumanMessage(job.question ?? defaultQuestion),
        ],
        agent,
      ),
    ),
    LoggerService.RTE.debug("Messages %O"),
  );
};
