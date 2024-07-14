import { type ResourcesNames } from "@liexp/shared/lib/io/http/ResourcesNames.js";
import { get } from "lodash";
import * as React from "react";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { Button, Stack } from "../../mui/index.js";
import { LoadingIndicator, useRecordContext } from "../react-admin";

interface OpenAIPromptButtonProps {
  type?: string;
  resource: ResourcesNames;
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
    <Stack direction="row">
      <Button
        variant="contained"
        size="small"
        onClick={() => {
          if (isLoading) return;
          ingestFile();
        }}
      >
        OpenAI: Embed this file
      </Button>
      {isLoading && <LoadingIndicator />}
    </Stack>
  );
};
