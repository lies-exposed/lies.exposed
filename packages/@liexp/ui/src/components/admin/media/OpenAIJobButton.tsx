import * as Queue from "@liexp/shared/lib/io/http/Queue.js";
import get from "lodash/get.js";
import * as React from "react";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { Typography } from "../../mui/index.js";
import { Link, type RaRecord, useRecordContext } from "../react-admin.js";
import { OpenAIButton } from "./OpenAIButton.js";

interface OpenAIPromptButtonProps<A extends RaRecord> {
  type?: Queue.QueueTypes;
  resource: Queue.QueueResourceNames;
  idSource?: string;
  prompt?: string;
  model?: string;
  transformValue: (
    value: A,
  ) => Omit<Queue.CreateQueue["data"], "prompt" | "result">;
}

const DEFAULT_PROMPT = `Rephrase the given text in maximum 100 words, without inventing details`;

export const OpenAIEmbeddingJobButton = <A extends RaRecord = RaRecord>({
  model = "gpt-4",
  prompt = DEFAULT_PROMPT,
  resource,
  type = "openai-embedding",
  idSource = "id",
  transformValue,
}: OpenAIPromptButtonProps<A>): React.ReactNode => {
  const [isLoading, setLoading] = React.useState(false);
  const [queue, setQueue] = React.useState<Queue.Queue | null>(null);
  const api = useDataProvider();
  const record = useRecordContext<A>();

  const id = get(record, idSource);

  if (!record || !id) {
    return null;
  }

  const value = transformValue(record);

  const ingestFile: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    void api
      .post(`queues/${type}/${resource}`, {
        data: { result: undefined, ...value, prompt },
        id,
      })
      .finally(() => {
        setLoading(false);
      });
  };

  React.useEffect(() => {
    void api
      .get<{ data: Queue.Queue }>(`queues/${type}/${resource}/${id}`, {})
      .then((queue) => {
        if (
          !Queue.Status.types[3].is(queue.data.status) &&
          !Queue.Status.types[2].is(queue.data.status)
        ) {
          setQueue(queue.data);
        } else {
          setQueue(null);
        }
      })
      .catch(() => {
        setQueue(null);
      });
  }, []);

  return queue ? (
    <Typography>
      Job in the queue with status{" "}
      <Typography component={"b"} fontWeight={"bold"}>
        {queue.status}
      </Typography>{" "}
      exists.
      <Link to={`/queues/${type}/${resource}/${id}`}>Check the job</Link>
    </Typography>
  ) : (
    <OpenAIButton
      model={model}
      prompt={prompt}
      onClick={ingestFile}
      isLoading={isLoading}
      label="Embed this file"
    />
  );
};
