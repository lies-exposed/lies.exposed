import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import type * as Queue from "@liexp/io/lib/http/Queue/index.js";
import * as io from "@liexp/io/lib/index.js";
import { toAPIError } from "@liexp/shared/lib/utils/APIError.utils.js";
import * as React from "react";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { MenuItem, Select, Stack, Typography } from "../../mui/index.js";
import { OpenAIButton } from "../media/OpenAIButton.js";
import {
  Link as RALink,
  useListContext,
  useRefresh,
  useNotify,
} from "../react-admin.js";

const QUEUE_TYPE = "openai-create-event-from-links";

export const CreateEventFromLinksButton: React.FC = () => {
  const { selectedIds } = useListContext();
  const api = useDataProvider();
  const refresh = useRefresh();
  const notify = useNotify();

  const [queue, setQueue] = React.useState<Queue.Queue | null>(null);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [eventType, setEventType] = React.useState<string>(
    io.http.Events.EventType.members[0].literals[0],
  );

  // Reset state when selection changes
  React.useEffect(() => {
    setQueue(null);
    setJobId(null);
  }, [selectedIds.join(",")]);

  const createQueueJob: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (selectedIds.length < 2) {
      notify("Please select at least 2 links to create an event", {
        type: "warning",
      });
      return;
    }

    // Generate a new UUID for the event that will be created
    const newEventId = uuid();

    void api
      .post(`queues/${QUEUE_TYPE}/events`, {
        data: {
          linkIds: selectedIds,
          type: eventType,
          date: undefined,
        },
        id: newEventId,
      })
      .then(() => {
        setJobId(newEventId);
        notify("AI queue job created successfully", { type: "success" });
        refresh();
        // Fetch the newly created queue job
        return api
          .get<{
            data: Queue.Queue;
          }>(`queues/${QUEUE_TYPE}/events/${newEventId}`, {})
          .then((queue) => {
            setQueue(queue.data);
          });
      })
      .catch((error: unknown) => {
        notify(`Failed to create queue job: ${toAPIError(error).message}`, {
          type: "error",
        });
      });
  };

  if (selectedIds.length < 2) {
    return null;
  }

  const queueStatus = queue?.status ? (
    <Typography component="span" fontWeight="bold">
      {queue.status}
    </Typography>
  ) : null;

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Select
          size="small"
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value);
          }}
          sx={{ minWidth: 150 }}
        >
          {io.http.Events.EventType.members.map((t) => (
            <MenuItem key={t.literals[0]} value={t.literals[0]}>
              {t.literals[0]}
            </MenuItem>
          ))}
        </Select>
        <OpenAIButton
          label={`Create Event from ${selectedIds.length} Links`}
          description="AI will synthesize information from all selected links to create a single event"
          onClick={createQueueJob}
        />
      </Stack>
      {queue && jobId ? (
        <Typography variant="body2">
          Queue job created with status {queueStatus}.{" "}
          <RALink to={`/queues/${QUEUE_TYPE}/events/${jobId}`}>
            Check the job
          </RALink>
        </Typography>
      ) : null}
    </Stack>
  );
};
