import { type AvailableModels } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { type BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { LINKS } from "@liexp/shared/lib/io/http/Link.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { type Queue } from "@liexp/shared/lib/io/http/index.js";
import { Schema } from "effect";
import { toAIBotError } from "../../common/error/index.js";
import { type ClientContextRTE } from "../../types.js";
import { updateActorFlow } from "./actor/updateActor.flow.js";
import { loadDocs } from "./common/loadDocs.flow.js";
import { updateGroupFlow } from "./group/updateGroup.flow.js";
import { updateLinkFlow } from "./link/updateLink.flow.js";
import { getPromptForJob } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = "Write a summary of the text.";

const embedAndQuestionCommonFlow = (
  job: Omit<Queue.Queue, "data" | "type"> & CreateQueueEmbeddingTypeData,
): ClientContextRTE<string> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.apS("docs", loadDocs(job)),
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
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

export const embedAndQuestionFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  | string
  | { title: string; description: string }
  | {
      excerpt: BlockNoteDocument;
    }
> = (job) => {
  if (Schema.is(LINKS)(job.resource)) {
    return updateLinkFlow(job);
  }

  if (Schema.is(ACTORS)(job.resource)) {
    return updateActorFlow(job);
  }

  if (Schema.is(GROUPS)(job.resource)) {
    return updateGroupFlow(job);
  }

  return embedAndQuestionCommonFlow(job);
};
