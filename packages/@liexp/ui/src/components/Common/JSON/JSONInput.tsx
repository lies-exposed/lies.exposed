/* gist.github.com/phanngoc/473229c74d0119704d9c603b1251782a */
import "is-plain-object";
import * as React from "react";
import { Button, Labeled, useInput } from "react-admin";

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

  const JSONView =
    React.useMemo((): React.ComponentType<any> => {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require("react-json-view").default;
      }
      // eslint-disable-next-line react/display-name
      return () => <div />;
    }, [typeof window !== "undefined"]);

  const [json, setJSON] = React.useState(value);

  return (
    <Labeled {...props} label={label} fullWidth>
      <>
        <JSONView
          src={json}
          onAdd={(add: any) => {
            setJSON(add.updated_src);
          }}
          onEdit={(edit: any) => {
            setJSON(edit.updated_src);
          }}
          onDelete={(del: any) => {
            setJSON(null);
          }}
        />

        <Button label="Clear" onClick={() => onClear?.()} />
        <Button label="Save" onClick={() => { onChange(json); }} />
      </>
    </Labeled>
  );
};

export default JSONInput;
