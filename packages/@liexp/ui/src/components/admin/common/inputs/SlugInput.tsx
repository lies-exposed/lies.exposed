import kebabCase from "lodash/kebabCase.js";
import * as React from "react";
import { TextInput, type TextInputProps } from "react-admin";

export interface SlugInputProps extends TextInputProps {
  label?: string;
  source: string;
  style?: React.CSSProperties;
}

export const SlugInput: React.FC<SlugInputProps> = ({
  source,
  label = source,
  style,
  defaultValue = "",
  ...props
}) => {
  const defaultSlug = kebabCase(defaultValue);

  return (
    <TextInput
      {...props}
      style={{ minWidth: 300, ...style }}
      label={label}
      source={source}
      parse={(value) => {
        return value.replace(/\s/g, "-").toLowerCase();
      }}
      defaultValue={defaultSlug}
    />
  );
};
