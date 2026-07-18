import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueTextTypeData } from "@liexp/io/lib/http/Queue/index.js";
import { toAIBotError } from "../../common/error/index.js";
import { getPromptFromResource } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = "Please summarize the provided text";
export const summarizeTextFlow: JobProcessRTE<CreateQueueTextTypeData> = (
  job,
) => {
  // Guard against empty/whitespace-only text reaching the agent: the caller
  // (or an upstream failed step whose error message ended up here) may pass
  // blank content, which the agent has no way to summarize meaningfully and
  // can error out on downstream.
  if (job.data.text.trim().length === 0) {
    return fp.RTE.left(
      toAIBotError(new Error("Cannot summarize: job.data.text is empty")),
    );
  }

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
