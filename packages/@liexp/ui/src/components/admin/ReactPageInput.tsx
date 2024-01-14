import { fp } from "@liexp/core/lib/fp/index.js";
import { createExcerptValue, isValidValue } from "@liexp/shared/lib/slate/index.js";
import { type EditorProps } from "@react-page/editor/lib-es/index.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { Labeled, useInput, type InputProps } from "react-admin";
import Editor from "../Common/Editor/Editor.js";
import { cellPlugins, minimalCellPlugins } from "../Common/Editor/cellPlugins.js";
import JSONInput from "../Common/JSON/JSONInput.js";
import { Box, Button, FormControlLabel, Paper, Switch } from "../mui/index.js";

export type RaReactPageInputProps = {
  className?: string;
  label?: string;
  source: string;
  style?: React.CSSProperties;
} & EditorProps;

const RaReactPageInput: React.FC<RaReactPageInputProps> = ({
  label = "Content",
  source,
  style,
  onChange: _onChange,
  className,
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
    [value, isValidJSON],
  );

  const [showJSONEditor, setShowJSONEditor] = React.useState(false);

  const handleClear = (): void => {
    const value = createExcerptValue("");
    onChange(value);
    setShowJSONEditor(false);
  };

  return (
    <Labeled
      className={className}
      label={label}
      source={source}
      fullWidth
      component="div"
    >
      <>
        <FormControlLabel
          style={{ marginBottom: 10, marginTop: 10 }}
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
              <pre>{JSON.stringify(value)}</pre>
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

const ReactPageInput: React.FC<
  InputProps & { className?: string; onlyText?: boolean }
> = ({ onlyText = false, ...props }) => {
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
