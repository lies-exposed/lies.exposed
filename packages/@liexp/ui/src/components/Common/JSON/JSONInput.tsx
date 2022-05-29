/* gist.github.com/phanngoc/473229c74d0119704d9c603b1251782a */
import "is-plain-object";
import * as React from "react";
import {
  Button,
  Labeled, useEditController,
  useRefresh
} from "react-admin";
import ReactJson from "react-json-view";

export interface JSONInputProps {
  label?: string;
  source: string;
  style?: React.CSSProperties;
}

const JSONInput: React.FC<JSONInputProps> = ({
  label = "Content",
  style,
  ...props
}) => {
  const { record, data, ...editContext } = useEditController(props);
  const [json, setJSON] = React.useState(data?.[props.source]);
  const refresh = useRefresh();

  const onSave = (r: any): void => {
    void editContext.save?.(
      {
        ...data,
        [props.source]: r,
      },
      {
        onSuccess: () => {
          refresh();
        },
      }
    );
  };

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
            setJSON(null)
          }}
        />
        <Button label="Clear" onClick={() => onSave(null)} />
        <Button label="Save" onClick={() => onSave(json)} />
      </>
    </Labeled>
  );
};

export default JSONInput;
