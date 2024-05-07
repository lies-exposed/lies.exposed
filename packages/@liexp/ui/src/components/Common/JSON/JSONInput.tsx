import { JsonEditor } from "jsoneditor-react";
import * as React from "react";
import { Button, Labeled, TextInputProps, useInput } from "react-admin";

export interface JSONInputProps extends TextInputProps {
  label?: string;
  source: string;
  style?: React.CSSProperties;
  onClear?: () => void;
}

const JSONInput: React.FC<JSONInputProps> = ({
  source,
  label = source,
  style,
  onClear,
  ...props
}) => {
  const {
    field: { value, onChange },
  } = useInput({ ...props, source, defaultValue: props.defaultValue ?? "" });

  return (
    <Labeled label={label} fullWidth>
      <>
        <JsonEditor
          value={value}
          onChange={onChange}
          mode="text"
          theme="ace/theme/github"
        />

        <Button label="Clear" onClick={() => onClear?.()} />
      </>
    </Labeled>
  );
};

export default JSONInput;
