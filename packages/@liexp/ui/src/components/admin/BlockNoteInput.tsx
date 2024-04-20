import { fp } from "@liexp/core/lib/fp/index.js";
import { PARAGRAPH_TYPE } from "@liexp/react-page/lib/customSlate.js";
import {
  DeserializeSlatePluginFN,
  isValidValue,
  transform,
} from "@liexp/react-page/lib/utils.js";
import { get } from "lodash";
import * as React from "react";
import {
  Labeled,
  useInput,
  useRecordContext,
  type InputProps,
} from "react-admin";
import { ErrorBoundary } from "react-error-boundary";
import { BNEditor, BNEditorProps } from "../Common/BlockNote/Editor.js";
import { type BNESchemaEditor } from "../Common/BlockNote/EditorSchema.js";
import { ErrorBox } from "../Common/ErrorBox.js";
import JSONInput from "../Common/JSON/JSONInput.js";
import { FormControlLabel, Paper, Switch } from "../mui/index.js";

const deserializeSlatePluginToBlockNoteEditor: DeserializeSlatePluginFN<any> = (
  p,
) => {
  if (p.type === PARAGRAPH_TYPE) {
    return fp.O.some(
      ((p as any).children ?? []).map((c: any) => ({
        type: "paragraph",
        content: c.text,
      })),
    );
  }
  return fp.O.none;
};

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
  variant,
  readOnly,
}) => {
  const record = useRecordContext();
  const defaultValue = get(record, source) ?? [];

  const {
    field: { value, onChange },
  } = useInput<BNESchemaEditor["document"]>({
    source,
    format: (v) => {
      if (isValidValue(v)) {
        return transform(v, deserializeSlatePluginToBlockNoteEditor);
      }
      return v;
    },
    defaultValue,
  });

  const [showJSONEditor, setShowJSONEditor] = React.useState(false);

  const handleClear = (): void => {
    onChange([]);
    setShowJSONEditor(false);
  };

  // const parseReactPageValue = (value: Value) => {
  //   const content = getTextContents(editor.liexpSlate)(value);
  // };

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
        </>
      </ErrorBoundary>
    </Labeled>
  );
};

const BlockNoteInput: React.FC<
  InputProps & {
    className?: string;
    onlyText?: boolean;
  }
> = ({ onlyText = false, readOnly, ...props }) => {
  return (
    <RaBlockNoteInput
      {...props}
      label={typeof props.label === "string" ? props.label : props.source}
      variant={onlyText ? "plain" : "extended"}
      readOnly={readOnly ?? false}
    />
  );
};

export default BlockNoteInput;
