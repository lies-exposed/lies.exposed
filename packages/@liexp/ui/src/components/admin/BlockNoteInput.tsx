import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import get from "lodash/get.js";
import * as React from "react";
import {
  Labeled,
  useInput,
  useRecordContext,
  type InputProps,
} from "react-admin";
import { ErrorBoundary } from "react-error-boundary";
import { BNEditor, type BNEditorProps } from "../Common/BlockNote/index.js";
import { ResettableErrorBox } from "../Common/ErrorBox.js";
import JSONInput from "../Common/JSON/JSONInput.js";
import { FormControlLabel, Paper, Stack, Switch } from "../mui/index.js";

export interface RaBlockNoteInputProps extends Omit<BNEditorProps, "content"> {
  className?: string;
  label?: string;
  source: string;
  style?: React.CSSProperties;
  variant?: "plain" | "extended";
}

const RaBlockNoteInput: React.FC<RaBlockNoteInputProps> = ({
  label = "Content",
  source,
  style,
  onChange: _onChange,
  className,
  variant: _variant,
  readOnly,
}) => {
  const record = useRecordContext();
  const defaultValue = get(record, source) ?? [];

  const {
    field: { value, onChange },
  } = useInput({
    source,
    format: toInitialValue,
    defaultValue,
  });

  const [showJSONEditor, setShowJSONEditor] = React.useState(false);

  const handleClear = (): void => {
    onChange([]);
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
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            style={{ marginBottom: 10, marginTop: 10 }}
            control={
              <Switch
                size="small"
                checked={!showJSONEditor}
                onChange={(ev, c) => {
                  setShowJSONEditor(!c);
                }}
              />
            }
            label={!showJSONEditor ? "RichEditor" : "JSON"}
          />
        </Stack>

        <ErrorBoundary
          fallbackRender={(props) => (
            <ResettableErrorBox {...props} style={{ maxWidth: 800 }} />
          )}
        >
          <Paper
            elevation={5}
            style={{
              overflow: "visible",
              padding: 16,
              ...style,
            }}
          >
            {!showJSONEditor ? (
              <BNEditor
                content={value}
                readOnly={!!readOnly}
                onChange={onChange}
              />
            ) : (
              <JSONInput
                source={source}
                onClear={() => {
                  handleClear();
                }}
              />
            )}
          </Paper>
        </ErrorBoundary>
      </Stack>
    </Labeled>
  );
};

const BlockNoteInput: React.FC<
  InputProps & {
    className?: string;
    onlyText?: boolean;
    readOnly?: boolean;
  }
> = ({ onlyText = false, readOnly = false, ...props }) => {
  return (
    <RaBlockNoteInput
      {...props}
      label={typeof props.label === "string" ? props.label : props.source}
      variant={onlyText ? "plain" : "extended"}
      readOnly={readOnly}
    />
  );
};

export default BlockNoteInput;
