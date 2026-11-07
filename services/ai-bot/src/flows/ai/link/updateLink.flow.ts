import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { URL } from "@liexp/io/lib/http/Common/index.js";
import {
  type CreateQueueEmbeddingTypeData,
  CreateQueueTextData,
  CreateQueueURLData,
} from "@liexp/io/lib/http/Queue/index.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type AIBotError, toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { parseISODate } from "../entityMatching.js";
import { fetchURLContent, type PageContent } from "../pageContent.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = `Return the requested information in JSON format with fields: title (string), description (string), publishDate (string in 'YYYY-MM-DD' format, or null if the content does not state it — never guess), thumbnailUrl (absolute URL or null).`;

const UpdateLinkStructuredResponse = Schema.Struct({
  title: Schema.String.annotations({
    description: "The title of the link",
  }),
  description: Schema.String.annotations({
    description: "The description of the link",
  }),
  publishDate: Schema.NullOr(Schema.String).annotations({
    description:
      "The date the content was published in 'YYYY-MM-DD' format, ONLY if stated in the content. Null if unknown — never guess.",
  }),
  thumbnailUrl: Schema.NullOr(URL).annotations({
    description:
      "Absolute URL of the main representative image (og:image, Twitter card, or prominent article image). Null if not found.",
  }),
});
type UpdateLinkStructuredResponse = typeof UpdateLinkStructuredResponse.Type;

const isURLData = (
  data: (typeof CreateQueueEmbeddingTypeData.Type)["data"],
): data is typeof CreateQueueURLData.Type =>
  Schema.is(CreateQueueURLData)(data);

const isTextData = (
  data: (typeof CreateQueueEmbeddingTypeData.Type)["data"],
): data is typeof CreateQueueTextData.Type =>
  Schema.is(CreateQueueTextData)(data);

const getPageContentRTE = (
  data: (typeof CreateQueueEmbeddingTypeData.Type)["data"],
): ReaderTaskEither<ClientContext, AIBotError, PageContent> => {
  if (isURLData(data) && data.url) {
    return fetchURLContent(data.url);
  }
  return fp.RTE.right({
    content: isTextData(data) ? data.text : "",
    title: "",
    publishDate: null,
  });
};

const transformResult = (result: UpdateLinkStructuredResponse) => ({
  title: result.title,
  description: result.description,
  publishDate: pipe(parseISODate(result.publishDate), (d) =>
    d ? new Date(d) : null,
  ),
  thumbnailUrl: result.thumbnailUrl,
});

export const updateLinkFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  {
    title: string;
    description: string;
    publishDate: Date | null;
    thumbnailUrl: URL | null;
  }
> = (job) => {
  const data = job.data;

  return pipe(
    fp.RTE.Do,
    fp.RTE.bindW("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.bindW("pageContent", () => getPageContentRTE(data)),
    fp.RTE.bind("result", ({ prompt, pageContent }) =>
      pipe(
        AgentChatService.getStructuredOutput<
          ClientContext,
          UpdateLinkStructuredResponse
        >({
          message: `${prompt({
            vars: {
              text: [pageContent.title, pageContent.content]
                .filter(Boolean)
                .join("\n\n"),
            },
          })}\n\n${job.question ?? defaultQuestion}`,
          model: job.model ?? undefined,
          schema: UpdateLinkStructuredResponse,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    LoggerService.RTE.debug("Messages %O"),
    fp.RTE.map(({ result, pageContent }) => {
      const base = transformResult(result);
      // Provider-supplied date is authoritative; fall back to the model's.
      return {
        ...base,
        publishDate: pageContent.publishDate ?? base.publishDate,
      };
    }),
  );
};
