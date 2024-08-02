import * as React from "react";
import { TextInput, type TextInputProps } from "react-admin";
import { Stack } from "../../../mui/index";
import { SlugInput } from "./SlugInput";

export interface JSONInputProps extends TextInputProps {
  label?: string;
  source: string;
  slugSource?: string;
  style?: React.CSSProperties;
  onClear?: () => void;
}

export const TextWithSlugInput: React.FC<JSONInputProps> = ({
  source,
  slugSource = "slug",
  label = source,
  style,
  onClear,
  defaultValue = "",
  ...props
}) => {
  return (
    <Stack style={style}>
      <TextInput {...props} source={source} defaultValue={defaultValue} />
      <SlugInput {...props} source={slugSource} />
    </Stack>
  );
};
