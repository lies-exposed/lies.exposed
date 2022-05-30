/* gist.github.com/phanngoc/473229c74d0119704d9c603b1251782a */
import "is-plain-object";
import * as React from "react";
import {
  Button,
  Labeled, useInput
} from "react-admin";
import ReactJson from "react-json-view";

export interface JSONInputProps {
  label?: string;
  source: string;
  style?: React.CSSProperties;
  onClear?: () => void;
}

const JSONInput: React.FC<JSONInputProps> = ({
  label = "Content",
  style,
  source,
  onClear,
  ...props
}) => {
  const {
    field: { value, onChange },
  } = useInput({ source });

  const [json, setJSON] = React.useState(value);

  return (
    <Labeled {...props} label={label} fullWidth>
      <>
        <ReactJson
          src={json}
          onAdd={(add) => {
            setJSON(add.updated_src);
          }}
          onEdit={(edit) => {
            setJSON(edit.updated_src);
          }}
          onDelete={(del) => {
            setJSON(null);
          }}
        />
        <Button label="Clear" onClick={() => onClear?.()} />
        <Button label="Save" onClick={() => onChange(json)} />
      </>
    </Labeled>
  );
};

export default JSONInput;
