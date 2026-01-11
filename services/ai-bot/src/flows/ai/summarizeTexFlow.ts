import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueTextTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { getPromptFromResource } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = "Please summarize the provided text";
export const summarizeTextFlow: JobProcessRTE<CreateQueueTextTypeData> = (
  job,
) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("prompt", () => {
      if (job.prompt) {
        return fp.RTE.right(() => job.prompt!);
      }
      return fp.RTE.right(getPromptFromResource(job.resource, job.type));
    }),
    fp.RTE.chainW(({ prompt }) =>
      pipe(
        AgentChatService.getRawOutput({
          message: `${prompt({
            vars: {
              text: job.data.text,
            },
          })}\n\n${job.question ?? defaultQuestion}`,
          conversationId: null,
        }),
      ),
    ),
  );
};
