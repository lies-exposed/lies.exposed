import kebabCase from "lodash/kebabCase.js";
import * as React from "react";
import { Labeled, TextInput, type TextInputProps } from "react-admin";

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
    <Labeled label={label} fullWidth>
      <>
        <TextInput
          {...props}
          source={source}
          parse={(value) => {
            return value.replace(/\s/g, "-").toLowerCase();
          }}
          defaultValue={defaultSlug}
        />
      </>
    </Labeled>
  );
};
