import { GetJobProcessors } from "../processPendingJob.flow.js";
import { embedAndQuestionFlow } from "./embedAndQuestion.js";
import { summarizeTextFlow } from "./summarizeTexFlow.js";

export const JobProcessor = GetJobProcessors({
  "openai-summarize": summarizeTextFlow,
  "openai-embedding": embedAndQuestionFlow,
});
