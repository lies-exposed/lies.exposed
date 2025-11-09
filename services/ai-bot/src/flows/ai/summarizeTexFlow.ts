import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateQueueTextTypeData } from "@liexp/shared/lib/io/http/Queue/index.js";
import { toAIBotError } from "../../common/error/index.js";
import { type ClientContext } from "../../context.js";
import { loadDocs } from "./common/loadDocs.flow.js";
import { getPromptFromResource } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = "Please summarize the provided text";
export const summarizeTextFlow: JobProcessRTE<CreateQueueTextTypeData> = (
  job,
) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("docs", () => loadDocs(job)),
    fp.RTE.bind("prompt", () => {
      if (job.prompt) {
        return fp.RTE.right(() => job.prompt!);
      }
      return fp.RTE.right(getPromptFromResource(job.resource, job.type));
    }),
    fp.RTE.chainW(
      ({ docs, prompt }) =>
        (ctx: ClientContext) =>
          pipe(
            ctx.agent.Chat.Create({
              Body: {
                message: `${prompt({
                  vars: {
                    text: docs.map((d) => d.pageContent).join("\n"),
                  },
                })}\n\n${job.question ?? defaultQuestion}`,
                conversation_id: null,
              },
            }),
            fp.TE.map((response) => response.data.message.content),
            fp.TE.mapLeft(toAIBotError),
          ),
    ),
  );
};
