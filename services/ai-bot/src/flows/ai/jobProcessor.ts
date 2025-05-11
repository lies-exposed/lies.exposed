import { OpenAICreateEventFromTextType } from "@liexp/shared/lib/io/http/Queue/event/CreateEventFromTextQueueData.js";
import { OpenAICreateEventFromURLType } from "@liexp/shared/lib/io/http/Queue/event/CreateEventFromURLQueue.js";
import { OpenAIUpdateEventQueueType } from "@liexp/shared/lib/io/http/Queue/event/UpdateEventQueue.js";
import {
  OpenAIEmbeddingQueueType,
  OpenAISummarizeQueueType,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import { embedAndQuestionFlow } from "./embedAndQuestion.js";
import { createEventFromTextFlow } from "./event/createEventFromText.flow.js";
import { createEventFromURLFlow } from "./event/createEventFromURL.flow.js";
import { updateEventFlow } from "./event/updateEvent.flow.js";
import { summarizeTextFlow } from "./summarizeTexFlow.js";
import { GetJobProcessor } from "#services/job-processor/job-processor.service.js";

export const JobProcessor = GetJobProcessor({
  [OpenAISummarizeQueueType.literals[0]]: summarizeTextFlow,
  [OpenAIEmbeddingQueueType.literals[0]]: embedAndQuestionFlow,
  [OpenAICreateEventFromURLType.literals[0]]: createEventFromURLFlow,
  [OpenAICreateEventFromTextType.literals[0]]: createEventFromTextFlow,
  [OpenAIUpdateEventQueueType.literals[0]]: updateEventFlow,
});
