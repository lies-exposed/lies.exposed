import { OpenAICreateEventFromTextType } from "@liexp/shared/lib/io/http/Queue/CreateEventFromTextQueueData.js";
import { OpenAICreateEventFromURLType } from "@liexp/shared/lib/io/http/Queue/CreateEventFromURLQueue.js";
import {
  OpenAIEmbeddingQueueType,
  OpenAISummarizeQueueType,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import { createEventFromTextFlow } from "./createEventFromText.flow.js";
import { createEventFromURLFlow } from "./createEventFromURL.flow.js";
import { embedAndQuestionFlow } from "./embedAndQuestion.js";
import { summarizeTextFlow } from "./summarizeTexFlow.js";
import { GetJobProcessor } from "#services/job-processor/job-processor.service.js";

export const JobProcessor = GetJobProcessor({
  [OpenAISummarizeQueueType.value]: summarizeTextFlow,
  [OpenAIEmbeddingQueueType.value]: embedAndQuestionFlow,
  [OpenAICreateEventFromURLType.value]: createEventFromURLFlow,
  [OpenAICreateEventFromTextType.value]: createEventFromTextFlow,
});
