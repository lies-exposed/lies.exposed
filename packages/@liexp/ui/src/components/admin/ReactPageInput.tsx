/* gist.github.com/phanngoc/473229c74d0119704d9c603b1251782a */
import { createExcerptValue, isValidValue } from "@liexp/shared/slate";
import Editor, { EditorProps } from "@react-page/editor";
import get from "lodash/get";
import * as React from "react";
import { InputProps, Labeled, useInput, useRecordContext } from "react-admin";
import { cellPlugins, minimalCellPlugins } from "../Common/Editor";
import JSONInput from "../Common/JSON/JSONInput";
import { Box, FormControlLabel, Paper, Switch } from "../mui";

export type RaReactPageInputProps = {
  label?: string;
  source: string;
  style?: React.CSSProperties;
} & EditorProps;
const RaReactPageInput: React.FC<RaReactPageInputProps> = ({
  label = "Content",
  source,
  style,
  onChange: _onChange,
  ...editorProps
}) => {
  const record = useRecordContext();

  const {
    field: { value, onChange },
  } = useInput({ source, defaultValue: get(record, source) });

  const isValueValid = React.useMemo(
    () =>
      value === null || isValidValue(value) || JSON.stringify(value) === "{}",
    [value]
  );

  const [showJSONEditor, setShowJSONEditor] = React.useState(!isValueValid);

  return (
    <Labeled
      label={
        <Box style={{ display: "flex" }}>
          <Box style={{ display: "flex", flexGrow: 1 }}>{label}</Box>

          <FormControlLabel
            control={
              <Switch
                defaultChecked={!showJSONEditor}
                onChange={(ev, c) => {
                  setShowJSONEditor(!c);
                }}
              />
            }
            label={!showJSONEditor ? "RichEditor" : "JSON"}
          />
        </Box>
      }
      source={source}
      fullWidth
    >
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
          {isValueValid ? (
            showJSONEditor ? (
              <JSONInput
                source={source}
                onClear={() => {
                  const value = createExcerptValue("");
                  onChange(value);
                  setShowJSONEditor(false);
                }}
              />
            ) : (
              <Editor value={value} {...editorProps} onChange={onChange} />
            )
          ) : (
            <JSONInput
              source={source}
              onClear={() => {
                const value = createExcerptValue("");
                onChange(value);
                setShowJSONEditor(false);
              }}
            />
          )}
        </Paper>
      </>
    </Labeled>
  );
};

const ReactPageInput: React.FC<InputProps & { onlyText?: boolean }> = ({
  onlyText = false,
  ...props
}) => {
  return (
    <RaReactPageInput
      {...props}
      label={typeof props.label === "string" ? props.label : props.source}
      cellPlugins={onlyText ? minimalCellPlugins : cellPlugins}
      lang="en"
    />
  );
};

export default ReactPageInput;
