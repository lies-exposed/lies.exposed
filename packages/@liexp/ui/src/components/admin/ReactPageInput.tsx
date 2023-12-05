import { fp } from "@liexp/core/lib/fp/index.js";
import { type EditorProps } from "@liexp/react-page/lib/react-page.types.js";
import { isValidValue } from "@liexp/react-page/lib/utils.js";
import { pipe } from "fp-ts/lib/function.js";
import { get } from "lodash";
import * as React from "react";
import {
  Labeled,
  useInput,
  useRecordContext,
  type InputProps,
} from "react-admin";
import { ErrorBoundary } from "react-error-boundary";
import { editor } from "../Common/Editor/index.js";
import { ErrorBox } from "../Common/ErrorBox.js";
import JSONInput from "../Common/JSON/JSONInput.js";
import { Box, Button, FormControlLabel, Paper, Switch } from "../mui/index.js";

export type RaReactPageInputProps = {
  className?: string;
  label?: string;
  source: string;
  style?: React.CSSProperties;
  variant?: "plain" | "extended";
} & Omit<EditorProps, "cellPlugins">;

const RaReactPageInput: React.FC<RaReactPageInputProps> = ({
  label = "Content",
  source,
  style,
  onChange: _onChange,
  className,
  variant,
  ...editorProps
}) => {
  const record = useRecordContext();
  const defaultValue = get(record, source) ?? editor.createExcerptValue("");
  const {
    field: { value, onChange },
  } = useInput({
    source,
    defaultValue,
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
    const value = editor.createExcerptValue("");
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
      <ErrorBoundary FallbackComponent={ErrorBox}>
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
              <editor.LazyEditor
                variant={variant}
                value={value}
                onChange={onChange}
                {...editorProps}
              />
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
      </ErrorBoundary>
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
      variant={onlyText ? "plain" : "extended"}
      lang="en"
    />
  );
};

export default ReactPageInput;
