import type { Event } from "@liexp/shared/lib/io/http/Events/index.js";
import { OpenAIUpdateEventQueueType } from "@liexp/shared/lib/io/http/Queue/event/UpdateEventQueue.js";
import type { Queue } from "@liexp/shared/lib/io/http/Queue/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { useAPI } from "../../../hooks/useAPI.js";
import { Box, Stack, Typography } from "../../mui/index.js";
import { OpenAIButton } from "../media/OpenAIButton.js";
import {
  Link as RALink,
  useRecordContext,
  useRefresh,
} from "../react-admin.js";

const QUEUE_TYPE = OpenAIUpdateEventQueueType.literals[0];

export const UpdateEventQueueButton: React.FC = () => {
  const record = useRecordContext<Event>();
  const api = useAPI();
  const refresh = useRefresh();

  const [queue, setQueue] = React.useState<Queue | null>(null);
  const [jobId, setJobId] = React.useState<string | null>(null);

  const createQueueJob: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (!record) return;

    // Use the existing event ID for the update
    const eventId = record.id;

    void pipe(
      api.Queues.Create({
        Params: {
          resource: "events",
          type: QUEUE_TYPE,
        },
        Body: {
          id: eventId,
          question: null,
          result: null,
          prompt: null,
          data: {
            id: record.id,
            type: record.type,
          },
        },
      }),
      throwTE,
    )
      .then((queue) => {
        setJobId(queue.data.id);
        setQueue(queue.data);
        refresh();
      })
      .catch((_error: Error) => {
        // TODO: Show user notification (e.g., using notify from react-admin)
      });
  };

  if (!record) {
    return <Box />;
  }

  const queueStatus = queue?.status ? (
    <Typography component="span" fontWeight="bold">
      {queue.status}
    </Typography>
  ) : null;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <OpenAIButton
          label="AI Update from Links"
          description="AI will analyze the event's links and update the event with new information"
          onClick={createQueueJob}
        />
      </Stack>
      {queue && jobId ? (
        <Typography variant="body2">
          Queue job exists with status {queueStatus}.{" "}
          <RALink to={`/queues/${QUEUE_TYPE}/events/${jobId}`}>
            Check the job
          </RALink>
        </Typography>
      ) : null}
    </Stack>
  );
};
