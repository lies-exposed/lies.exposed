import type * as Queue from "@liexp/io/lib/http/Queue/index.js";
import get from "lodash/get.js";
import * as React from "react";
import { useNavigate } from "react-router";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { Stack } from "../../mui/index.js";
import { QueueStatusIcon } from "../queue/QueueStatusIcon.js";
import { type RaRecord, useRecordContext, useRefresh } from "../react-admin.js";
import { OpenAIButton } from "./OpenAIButton.js";

interface OpenAIPromptButtonProps<A extends RaRecord> {
  type?: Queue.QueueTypes;
  resource: Queue.QueueResourceNames;
  idSource?: string;
  prompt?: string;
  question?: string;
  model?: string;
  label?: string;
  description?: string;
  transformValue: (
    value: A,
  ) => Omit<Queue.CreateQueue["data"], "question" | "prompt" | "result">;
}

export const OpenAIEmbeddingJobButton = <A extends RaRecord = RaRecord>({
  model = "gpt-4",
  prompt,
  question,
  description,
  resource,
  type = "openai-embedding",
  idSource = "id",
  label = "Embed with AI",
  transformValue,
}: OpenAIPromptButtonProps<A>): React.ReactNode => {
  const [queue, setQueue] = React.useState<Queue.Queue | null>(null);
  const api = useDataProvider();
  const record = useRecordContext<A>();
  const refresh = useRefresh();
  const navigate = useNavigate();

  const [id, setId] = React.useState(get(record, idSource));

  if (!record || !id) {
    return null;
  }

  const value = transformValue(record);

  const ingestFile: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();

    if (queue) {
      void navigate(`/queues/${type}/${resource}/${id}`);
      return;
    }

    void api
      .post(`queues/${type}/${resource}`, {
        data: { result: undefined, ...value, prompt, question },
        id,
      })
      .finally(() => {
        setId(id);
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
  }, [id]);

  const queueStatusIcon = queue?.status ? (
    <QueueStatusIcon status={queue.status} />
  ) : null;

  return (
    <Stack direction="row" spacing={1}>
      <OpenAIButton
        model={model}
        prompt={prompt}
        question={question}
        description={description}
        onClick={ingestFile}
        label={label}
        startIcon={queueStatusIcon}
        variant={!queue ? "contained" : "outlined"}
      />
    </Stack>
  );
};
