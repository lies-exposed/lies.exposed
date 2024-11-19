import { embedAndQuestionFlow } from "./embedAndQuestion.js";
import { summarizeTextFlow } from "./summarizeTexFlow.js";
import { GetJobProcessor } from "#services/job-processor/job-processor.service.js";

export const JobProcessor = GetJobProcessor({
  "openai-summarize": summarizeTextFlow,
  "openai-embedding": embedAndQuestionFlow,
});
