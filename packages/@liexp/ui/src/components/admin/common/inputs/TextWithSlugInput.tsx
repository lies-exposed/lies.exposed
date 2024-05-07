import { kebabCase } from "lodash";
import * as React from "react";
import { Labeled, TextInput, TextInputProps, useInput } from "react-admin";

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
  const labelInputProps = useInput({
    ...props,
    source,
    defaultValue: props.defaultValue ?? "",
  });

  const {
    field: { value: slug, onChange: onSlugChange },
    ...slugInputProps
  } = useInput({
    ...props,
    source: slugSource,
    parse(value) {
      return value.replace(/\s/g, "-");
    },
    defaultValue: kebabCase(labelInputProps.field.value),
  });

  return (
    <Labeled label={label} fullWidth>
      <>
        <TextInput {...labelInputProps} source={source} />
        <TextInput
          {...slugInputProps}
          source={slugSource}
          value={slug}
          onChange={onSlugChange}
        />
      </>
    </Labeled>
  );
};
