/* gist.github.com/phanngoc/473229c74d0119704d9c603b1251782a */
import { Paper } from "@mui/material";
import Editor, { EditorProps } from "@react-page/editor";
import "is-plain-object";
import * as React from "react";
import { InputProps, Labeled, useInput } from "react-admin";
import {
  cellPlugins,
  createExcerptValue,
  isValidValue,
  minimalCellPlugins,
} from "../Common/Editor";
import JSONInput from "../Common/JSON/JSONInput";

export type RaReactPageInputProps = {
  label?: string;
  source: string;
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

  const isValueValid = React.useMemo(
    () => isValidValue(value) || JSON.stringify(value) === "{}",
    [value]
  );

  const [toggleEdit, setToggleEditor] = React.useState(!isValueValid);

  return (
    <Labeled label={label} source={source} fullWidth>
      <>
        <div
          onClick={() => {
            setToggleEditor(!toggleEdit);
          }}
        >
          {toggleEdit ? "Plain" : "Slate"}
        </div>
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
            toggleEdit ? (
              <JSONInput
                source={source}
                onClear={() => {
                  const value = createExcerptValue("");
                  onChange(value);
                  setToggleEditor(false);
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
                setToggleEditor(false);
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
      label={props.source}
      cellPlugins={onlyText ? minimalCellPlugins : cellPlugins}
      lang="en"
    />
  );
};

export default ReactPageInput;
