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
        label="AI Update from Links"
        description="AI will analyze the event's links and update the event with new information"
        type={QUEUE_TYPE}
        resource={EVENTS.literals[0]}
        transformValue={(v) => v}
      />
    </Stack>
  );
};
