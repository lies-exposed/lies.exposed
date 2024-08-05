import * as React from "react";
import { AutoAwesome } from "../../mui/icons.js";
import { Button, Stack } from "../../mui/index.js";
import { LoadingIndicator } from "../react-admin.js";

export interface OpenAIButtonBaseProps {
  prompt?: string;
  model?: string;
}

interface OpenAIButtonProps extends OpenAIButtonBaseProps {
  onClick: () => void;
  label: string;
  isLoading: boolean;
}

const DEFAULT_PROMPT = `Rephrase the given text in maximum 100 words, without inventing details`;

export const OpenAIButton: React.FC<OpenAIButtonProps> = ({
  model = "gpt-4",
  prompt = DEFAULT_PROMPT,
  label,
  onClick,
}) => {
  const [isLoading, setLoading] = React.useState(false);

  const onButtonClick = () => {
    if (isLoading) return;
    setLoading(true);
    void Promise.resolve(onClick()).finally(() => {
      setLoading(false);
    });
  };
  return (
    <Stack direction="row">
      <Button
        variant="contained"
        size="small"
        onClick={onButtonClick}
        startIcon={<AutoAwesome />}
      >
        {label}
      </Button>
      {isLoading && <LoadingIndicator />}
    </Stack>
  );
};
