import { type AvailableModels } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { toAIBotError } from "../../common/error/index.js";
import { loadDocs } from "./loadDocs.flow.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = "Write a summary of the text.";

export const embedAndQuestionFlow: JobProcessRTE = (job) => (ctx) => {
  return pipe(
    loadDocs(job)(ctx),
    fp.TE.chain((docs) =>
      fp.TE.tryCatch(async () => {
        return ctx.langchain.queryDocument(
          docs,
          job.data.question ?? defaultQuestion,
          {
            model: ctx.config.config.localAi.models
              ?.embeddings as AvailableModels,
          },
        );
      }, toAIBotError),
    ),
  );
};
