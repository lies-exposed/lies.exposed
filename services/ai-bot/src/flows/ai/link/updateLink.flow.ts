import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueEmbeddingTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { Schema } from "effect";
import { AgentChatService } from "../../../services/agent-chat/agent-chat.service.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = `Return the requested information in JSON format with fields: title (string), description (string), publishDate (string in ISO 8601 format or empty string if not published).`;

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
type UpdateLinkStructuredResponse = typeof UpdateLinkStructuredResponse.Type;

export const updateLinkFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  { title: string; description: string }
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.bind("result", ({ prompt }) =>
      AgentChatService.getStructuredOutput<UpdateLinkStructuredResponse>({
        message: `${prompt({
          vars: {
            text: (job.data as any).url,
          },
        })}\n\n${job.question ?? defaultQuestion}`,
      }),
    ),
    LoggerService.RTE.debug("Messages %O"),
    fp.RTE.map(({ result }) => ({
      title: result.title,
      description: result.description,
    })),
  );
};
