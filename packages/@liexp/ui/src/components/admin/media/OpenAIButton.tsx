import * as React from "react";
import { AutoAwesome } from "../../mui/icons.js";
import { Button, Stack } from "../../mui/index.js";
import { LoadingIndicator } from "../react-admin.js";

export interface OpenAIButtonBaseProps {
  prompt?: string;
  model?: string;
}

interface OpenAIButtonProps extends OpenAIButtonBaseProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  label: string;
  isLoading: boolean;
}

export const OpenAIButton: React.FC<OpenAIButtonProps> = ({
  label,
  onClick,
}) => {
  const [isLoading, setLoading] = React.useState(false);

  const onButtonClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (isLoading) return;
    setLoading(true);
    void Promise.resolve(onClick(e)).finally(() => {
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
