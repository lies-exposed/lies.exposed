/* gist.github.com/phanngoc/473229c74d0119704d9c603b1251782a */
import { Paper } from "@material-ui/core";
import type { EditorProps } from "@react-page/editor";
import Editor from "@react-page/editor";
import "is-plain-object";
import * as React from "react";
import { InputProps, Labeled, useRecordContext, useInput, RaRecord } from "react-admin";
import { cellPlugins, minimalCellPlugins } from "../Common/Editor";

export type RaReactPageInputProps = {
  label?: string;
  source: string;
  record: RaRecord;
  style?: React.CSSProperties;
} & EditorProps;
const RaReactPageInput: React.FC<RaReactPageInputProps> = ({
  label = "Content",
  source,
  style,
  ...editorProps
}) => {
  const {
    field: { value, onChange },
  } = useInput({ source });
  return (
    <Labeled label={label} source={source} fullWidth>
      <>
        <Paper
          elevation={5}
          style={{
            overflow: "visible",
            padding: 16,
            marginRight: 64,

            ...style,
          }}
        >
          <Editor value={value} onChange={onChange} {...editorProps} />
        </Paper>
      </>
    </Labeled>
  );
};

const ReactPageInput: React.FC<InputProps & { onlyText?: boolean }> = ({
  onlyText = false,
  ...props
}) => {
  const record = useRecordContext();
  return (
    <RaReactPageInput
      {...props}
      label={props.source}
      record={record}
      cellPlugins={onlyText ? minimalCellPlugins : cellPlugins}
      lang="en"
    />
  );
};

export default ReactPageInput;
