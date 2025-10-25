import { runAgent } from "@liexp/backend/lib/flows/ai/runRagChain.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { effectToZodObject } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
import { HumanMessage, SystemMessage } from "langchain";
import { type ClientContext } from "../../../context.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = `
I would like to have a JSON object with 'title', 'description', 'publishDate' and main 'keywords' (as an array of strings) from the given url.
`;

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
            responseFormat: effectToZodObject({
              title: Schema.String,
              description: Schema.String,
              publishDate: Schema.String,
              keywords: Schema.Array(Schema.String),
            }),
          }),
        ),
    ),
    fp.RTE.chainW(({ prompt, agent }) =>
      runAgent<{ title: string; description: string }>(
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
