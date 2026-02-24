import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { ACTORS } from "@liexp/io/lib/http/Actor.js";
import { type BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { GROUPS } from "@liexp/io/lib/http/Group.js";
import { LINKS } from "@liexp/io/lib/http/Link.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/io/lib/http/Queue/index.js";
import { Schema } from "effect";
import { updateActorFlow } from "./actor/updateActor.flow.js";
import { updateGroupFlow } from "./group/updateGroup.flow.js";
import { updateLinkFlow } from "./link/updateLink.flow.js";
import { getPromptForJob } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = "Write a summary of the text.";

const embedAndQuestionCommonFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  string
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.chainW(({ prompt }) =>
      AgentChatService.getRawOutput({
        message: `${prompt({
          vars: {
            text: JSON.stringify(job.data),
          },
        })}\n\n${job.question ?? defaultQuestion}`,
        conversationId: null,
      }),
    ),
  );
};

export const embedAndQuestionFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  | string
  | { title: string; description: string; publishDate: Date | null }
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
