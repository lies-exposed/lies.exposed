import * as React from "react";
import { Labeled, TextInput, type TextInputProps } from "react-admin";
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
  ...props
}) => {
  const defaultValue = props.defaultValue ?? "";

  return (
    <Labeled label={label} fullWidth>
      <>
        <TextInput source={source} defaultValue={defaultValue} />
        <SlugInput source={slugSource} />
      </>
    </Labeled>
  );
};
