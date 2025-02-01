import { fp } from "@liexp/core/lib/fp/index.js";
import { OpenAICreateEventFromTextType } from "@liexp/shared/lib/io/http/Queue/CreateEventFromTextQueueData.js";
import { OpenAICreateEventFromURLType } from "@liexp/shared/lib/io/http/Queue/CreateEventFromURLQueue.js";
import {
  OpenAIEmbeddingQueueType,
  OpenAISummarizeQueueType,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import { type Queue } from "@liexp/shared/lib/io/http/index.js";
import { type ClientContextRTE } from "../../types.js";
import { embedAndQuestionFlow } from "./embedAndQuestion.js";
import { summarizeTextFlow } from "./summarizeTexFlow.js";
import { GetJobProcessor } from "#services/job-processor/job-processor.service.js";

export const JobProcessor = GetJobProcessor({
  [OpenAISummarizeQueueType.value]: summarizeTextFlow,
  [OpenAIEmbeddingQueueType.value]: embedAndQuestionFlow,
  [OpenAICreateEventFromURLType.value]: (
    job: Queue.Queue,
  ): ClientContextRTE<string> => fp.RTE.right(""),
  [OpenAICreateEventFromTextType.value]: (job: Queue.Queue) => fp.RTE.right(""),
});
