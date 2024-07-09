import { kebabCase } from "lodash";
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
  ...props
}) => {
  const defaultValue = props.defaultValue ?? "";
  const defaultSlug = kebabCase(defaultValue);

  return (
    <Labeled label={label} fullWidth>
      <>
        <TextInput
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
