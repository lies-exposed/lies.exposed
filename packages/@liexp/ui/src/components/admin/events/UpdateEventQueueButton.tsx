import { EVENTS } from "@liexp/io/lib/http/Events/index.js";
import { OpenAIUpdateEventQueueType } from "@liexp/io/lib/http/Queue/event/UpdateEventQueue.js";
import * as React from "react";
import { Stack } from "../../mui/index.js";
import { OpenAIEmbeddingJobButton } from "../media/OpenAIJobButton.js";

const QUEUE_TYPE = OpenAIUpdateEventQueueType.literals[0];

export const UpdateEventQueueButton: React.FC = () => {
  return (
    <Stack spacing={2}>
      <OpenAIEmbeddingJobButton
        label="AI Enrich Event"
        description="AI will read the event's links, propose field updates and extract actor, group and keyword relations. The result is reviewed in the queue before it is applied."
        type={QUEUE_TYPE}
        resource={EVENTS.literals[0]}
        transformValue={(v) => v}
      />
    </Stack>
  );
};
