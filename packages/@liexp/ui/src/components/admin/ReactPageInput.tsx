import { fp } from "@liexp/core/lib/fp";
import { createExcerptValue, isValidValue } from "@liexp/shared/lib/slate";
import { type EditorProps } from "@react-page/editor";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Labeled, useInput, type InputProps } from "react-admin";
import { LazyEditor as Editor } from "../Common/Editor";
import { cellPlugins, minimalCellPlugins } from "../Common/Editor/cellPlugins";
import JSONInput from "../Common/JSON/JSONInput";
import { Box, Button, FormControlLabel, Paper, Switch } from "../mui";

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
  const {
    field: { value, onChange },
  } = useInput({
    source,
    defaultValue: createExcerptValue(""),
  });

  const isValidJSON = React.useMemo(() => {
    if (value === "") {
      return false;
    }

    return pipe(fp.Json.parse(value), fp.E.isRight);
  }, [value]);

  const isValueValid = React.useMemo(
    () => value === "" || isValidValue(value) || isValidJSON,
    [value, isValidJSON]
  );

  const [showJSONEditor, setShowJSONEditor] = React.useState(false);

  const handleClear = (): void => {
    const value = createExcerptValue("");
    onChange(value);
    setShowJSONEditor(false);
  };

  return (
    <Labeled label={label} source={source} fullWidth>
      <>
        <FormControlLabel
          control={
            <Switch
              size="small"
              value={!showJSONEditor}
              onChange={(ev, c) => {
                setShowJSONEditor(!c);
              }}
            />
          }
          label={!showJSONEditor ? "RichEditor" : "JSON"}
        />
        <Paper
          elevation={5}
          style={{
            overflow: "visible",
            padding: 16,
            marginRight: 64,

            ...style,
          }}
        >
          {!showJSONEditor && isValueValid ? (
            <Editor value={value} onChange={onChange} {...editorProps} />
          ) : showJSONEditor && isValidJSON ? (
            <JSONInput
              source={source}
              onClear={() => {
                handleClear();
              }}
            />
          ) : (
            <Box>
              <pre>{value}</pre>
              <Button
                onClick={() => {
                  handleClear();
                }}
              >
                Clear
              </Button>
            </Box>
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
