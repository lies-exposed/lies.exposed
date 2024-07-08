import { kebabCase } from "lodash";
import * as React from "react";
import { Labeled, TextInput, type TextInputProps } from "react-admin";

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
  const defaultSlug = kebabCase(defaultValue);
  return (
    <Labeled label={label} fullWidth>
      <>
        <TextInput source={source} defaultValue={defaultValue} />
        <TextInput
          source={slugSource}
          parse={(value) => {
            return value.replace(/\s/g, "-");
          }}
          defaultValue={defaultSlug}
        />
      </>
    </Labeled>
  );
};
