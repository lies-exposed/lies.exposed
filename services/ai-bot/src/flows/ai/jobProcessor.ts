import { OpenAICreateEventFromLinksType } from "@liexp/io/lib/http/Queue/event/CreateEventFromLinksQueue.js";
import { OpenAICreateEventFromTextType } from "@liexp/io/lib/http/Queue/event/CreateEventFromTextQueueData.js";
import { OpenAICreateEventFromURLType } from "@liexp/io/lib/http/Queue/event/CreateEventFromURLQueue.js";
import { OpenAIUpdateEventQueueType } from "@liexp/io/lib/http/Queue/event/UpdateEventQueue.js";
import {
  OpenAIEmbeddingQueueType,
  OpenAISummarizeQueueType,
  OpenAIUpdateEntitiesFromURLType,
} from "@liexp/io/lib/http/Queue/index.js";
import { embedAndQuestionFlow } from "./embedAndQuestion.js";
import { createEventFromLinksFlow } from "./event/createEventFromLinks.flow.js";
import { createEventFromTextFlow } from "./event/createEventFromText.flow.js";
import { createEventFromURLFlow } from "./event/createEventFromURL.flow.js";
import { updateEventFlow } from "./event/updateEvent.flow.js";
import { summarizeTextFlow } from "./summarizeTexFlow.js";
import { updateEntitiesFromURLFlow } from "./updateEntitiesFromURL.flow.js";
import { GetJobProcessor } from "#services/job-processor/job-processor.service.js";

export const JobProcessor = GetJobProcessor({
  [OpenAISummarizeQueueType.literals[0]]: summarizeTextFlow,
  [OpenAIEmbeddingQueueType.literals[0]]: embedAndQuestionFlow,
  [OpenAICreateEventFromURLType.literals[0]]: createEventFromURLFlow,
  [OpenAICreateEventFromTextType.literals[0]]: createEventFromTextFlow,
  [OpenAICreateEventFromLinksType.literals[0]]: createEventFromLinksFlow,
  [OpenAIUpdateEventQueueType.literals[0]]: updateEventFlow,
  [OpenAIUpdateEntitiesFromURLType.literals[0]]: updateEntitiesFromURLFlow,
});
