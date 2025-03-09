import { type AvailableModels } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { toAIBotError } from "../../common/error/index.js";
import { loadDocs } from "./common/loadDocs.flow.js";
import { getPromptFromResource } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = "Write a summary of the text.";

export const embedAndQuestionFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.apS("docs", loadDocs(job)),
    fp.RTE.bind("prompt", () => {
      if (job.prompt) {
        return fp.RTE.right(() => job.prompt!);
      }
      return fp.RTE.right(getPromptFromResource(job.resource, job.type));
    }),
    fp.RTE.chain(
      ({ docs, prompt }) =>
        (ctx) =>
          fp.TE.tryCatch(() => {
            return ctx.langchain.queryDocument(
              docs,
              job.question ?? defaultQuestion,
              {
                model: ctx.config.config.localAi.models
                  ?.embeddings as AvailableModels,
                prompt,
              },
            );
          }, toAIBotError),
    ),
  );
};
