import type * as Queue from "@liexp/shared/lib/io/http/Queue.js";
import get from "lodash/get.js";
import * as React from "react";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { useRecordContext } from "../react-admin.js";
import { OpenAIButton } from "./OpenAIButton.js";

interface OpenAIPromptButtonProps {
  type?: Queue.QueueTypes;
  resource: Queue.QueueResourceNames;
  valueSource: string;
  idSource?: string;
  prompt?: string;
  model?: string;
}

const DEFAULT_PROMPT = `Rephrase the given text in maximum 100 words, without inventing details`;

export const OpenAIEmbeddingJobButton: React.FC<OpenAIPromptButtonProps> = ({
  model = "gpt-4",
  prompt = DEFAULT_PROMPT,
  resource,
  type = "openai-embedding",
  idSource = "id",
  valueSource = "value",
}) => {
  const [isLoading, setLoading] = React.useState(false);
  const api = useDataProvider();
  const record = useRecordContext();

  const id = get(record, idSource);
  const value = get(record, valueSource);

  if (!record || !id || !value) {
    return null;
  }

  const ingestFile = () => {
    void api
      .post(`queues/${type}/${resource}`, {
        data: {
          url: value,
        },
        id,
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <OpenAIButton
      model={model}
      prompt={prompt}
      onClick={ingestFile}
      isLoading={isLoading}
      label="Embed this file"
    />
  );
};
