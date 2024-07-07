import { embedAndQuestionFlow } from "./embedAndQuestion.js";
import { GetJobProcessors } from "./processJob.flow.js";
import { summarizeTextFlow } from "./summarizeTexFlow.js";

export const JobProcessor = GetJobProcessors({
  "openai-embedding": embedAndQuestionFlow,
  "openai-summarize": summarizeTextFlow,
});
