import type * as Queue from "@liexp/shared/lib/io/http/Queue/index.js";
import get from "lodash/get.js";
import * as React from "react";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { Stack, Typography } from "../../mui/index.js";
import {
  Link,
  type RaRecord,
  useRecordContext,
  useRefresh,
} from "../react-admin.js";
import { OpenAIButton } from "./OpenAIButton.js";

interface OpenAIPromptButtonProps<A extends RaRecord> {
  type?: Queue.QueueTypes;
  resource: Queue.QueueResourceNames;
  idSource?: string;
  prompt?: string;
  question?: string;
  model?: string;
  transformValue: (
    value: A,
  ) => Omit<Queue.CreateQueue["data"], "question" | "prompt" | "result">;
}

export const OpenAIEmbeddingJobButton = <A extends RaRecord = RaRecord>({
  model = "gpt-4",
  prompt,
  question,
  resource,
  type = "openai-embedding",
  idSource = "id",
  transformValue,
}: OpenAIPromptButtonProps<A>): React.ReactNode => {
  const [isLoading, setLoading] = React.useState(false);
  const [queue, setQueue] = React.useState<Queue.Queue | null>(null);
  const api = useDataProvider();
  const record = useRecordContext<A>();
  const refresh = useRefresh();

  const [id, setId] = React.useState(get(record, idSource));

  if (!record || !id) {
    return null;
  }

  const value = transformValue(record);

  const ingestFile: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    void api
      .post(`queues/${type}/${resource}`, {
        data: { result: undefined, ...value, prompt, question },
        id,
      })
      .finally(() => {
        setId(id);
        setLoading(false);
      });
  };

  React.useEffect(() => {
    void api
      .get<{ data: Queue.Queue }>(`queues/${type}/${resource}/${id}`, {})
      .then((queue) => {
        setQueue(queue.data);
      })
      .catch(() => {
        setQueue(null);
        refresh();
      });
  }, []);

  const queueStats = queue?.status ? (
    <Typography component={"b"} fontWeight={"bold"}>
      {queue.status}
    </Typography>
  ) : null;

  return (
    <Stack direction="row" spacing={1}>
      <OpenAIButton
        model={model}
        prompt={prompt}
        question={question}
        onClick={ingestFile}
        isLoading={isLoading}
        label="Embed this file"
      />
      {queue ? (
        <Typography>
          Job in the queue with status {queueStats} exists.
          <Link to={`/queues/${type}/${resource}/${id}`}>Check the job</Link>
        </Typography>
      ) : null}
    </Stack>
  );
};
