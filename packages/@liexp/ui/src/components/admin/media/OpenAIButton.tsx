import * as React from "react";
import { AutoAwesome } from "../../mui/icons.js";
import { Button, type ButtonProps, Stack, Tooltip } from "../../mui/index.js";
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
  variant?: ButtonProps["variant"];
  startIcon?: React.ReactNode;
}

export const OpenAIButton: React.FC<OpenAIButtonProps> = ({
  label,
  description,
  onClick,
  startIcon,
  variant = "contained",
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
      variant={variant}
      size="small"
      onClick={onButtonClick}
      startIcon={startIcon ?? <AutoAwesome />}
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
