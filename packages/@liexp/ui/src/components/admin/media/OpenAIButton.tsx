import * as React from "react";
import { AutoAwesome } from "../../mui/icons.js";
import { Button, Stack, Tooltip } from "../../mui/index.js";
import { LoadingIndicator } from "../react-admin.js";

export interface OpenAIButtonBaseProps {
  prompt?: string;
  question?: string;
  model?: string;
  description?: string;
}

interface OpenAIButtonProps extends OpenAIButtonBaseProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  label: string;
  isLoading: boolean;
}

export const OpenAIButton: React.FC<OpenAIButtonProps> = ({
  label,
  description,
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

  const button = (
    <Button
      variant="contained"
      size="small"
      onClick={onButtonClick}
      startIcon={<AutoAwesome />}
    >
      {label}
    </Button>
  );

  return (
    <Stack direction="row">
      {description ? (
        <Tooltip title={description} arrow placement="top">
          {button}
        </Tooltip>
      ) : (
        button
      )}
      {isLoading && <LoadingIndicator />}
    </Stack>
  );
};
