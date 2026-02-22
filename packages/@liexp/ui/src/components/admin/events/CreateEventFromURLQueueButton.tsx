import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { APPROVED, type Link } from "@liexp/io/lib/http/Link.js";
import type * as Queue from "@liexp/io/lib/http/Queue/index.js";
import * as io from "@liexp/io/lib/index.js";
import * as React from "react";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { Box, MenuItem, Select, Stack, Typography } from "../../mui/index.js";
import { OpenAIButton } from "../media/OpenAIButton.js";
import {
  Link as RALink,
  useRecordContext,
  useRefresh,
} from "../react-admin.js";

const QUEUE_TYPE = "openai-create-event-from-url";

export const CreateEventFromURLQueueButton: React.FC = () => {
  const record = useRecordContext<Link>();
  const api = useDataProvider();
  const refresh = useRefresh();

  const [queue, setQueue] = React.useState<Queue.Queue | null>(null);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [eventType, setEventType] = React.useState<string>(
    io.http.Events.EventType.members[0].literals[0],
  );

  const createQueueJob: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (!record) return;

    // Generate a new UUID for the event that will be created
    const newEventId = uuid();

    void api
      .post(`queues/${QUEUE_TYPE}/events`, {
        data: {
          url: record.url,
          type: eventType,
          date: record.publishDate ? new Date(record.publishDate) : undefined,
        },
        id: newEventId,
      })
      .then(() => {
        setJobId(newEventId);
        refresh();
        // Fetch the newly created queue job
        return api
          .get<{
            data: Queue.Queue;
          }>(`queues/${QUEUE_TYPE}/events/${newEventId}`, {})
          .then((queue) => {
            setQueue(queue.data);
          });
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
      <Typography variant="subtitle2">Create Event via AI Queue</Typography>
      {record.status !== APPROVED.literals[0] ? (
        <Typography variant="body2" color="warning.main">
          This link has status <strong>{record.status}</strong>. The created
          event will be saved as a draft.
        </Typography>
      ) : null}
      <Stack direction="row" spacing={2} alignItems="center">
        <Select
          size="small"
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value);
          }}
          sx={{ minWidth: 200 }}
        >
          {io.http.Events.EventType.members.map((t) => (
            <MenuItem key={t.literals[0]} value={t.literals[0]}>
              {t.literals[0]}
            </MenuItem>
          ))}
        </Select>
        <OpenAIButton
          label="Create Event from URL"
          description="AI will browse the link and create an event with the selected type"
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
