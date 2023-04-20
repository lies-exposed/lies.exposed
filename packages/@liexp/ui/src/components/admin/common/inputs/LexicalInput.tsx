import { type EditorState } from "lexical";
import get from "lodash/get";
import * as React from "react";
import { Labeled, useInput, useRecordContext } from "react-admin";
import { LexicalEditor } from "../../../Common/LexicalEditor";
import { Box, FormControlLabel, Paper, Switch, Typography } from "../../../mui";

export interface LexicalInputProps {
  label?: string;
  source: string;
  style?: React.CSSProperties;
}

export const LexicalInput: React.FC<LexicalInputProps> = ({
  label = "Content",
  source,
  style,
}) => {
  const record = useRecordContext();

  const [debug, setDebug] = React.useState(false);
  const {
    field: { value: _value, onChange: _onChange },
  } = useInput({ source, defaultValue: get(record, source) });

  const value = _value === "" ? undefined : _value;

  const onChange = (e: EditorState): void => {
    const jsonState = e.toJSON();
    _onChange(jsonState);
  };

  return (
    <Labeled
      label={
        <Box style={{ display: "flex" }}>
          <Box style={{ display: "flex", flexGrow: 1 }}>{label}</Box>
          <FormControlLabel
            control={
              <Switch
                size="small"
                value={debug}
                onChange={() => {
                  setDebug(!debug);
                }}
              />
            }
            label={
              <Typography variant="caption">
                {debug ? "Disable Tree View" : "Enable Tree View"}
              </Typography>
            }
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
          <LexicalEditor
            value={value}
            onChange={onChange}
            readOnly={false}
            debug={debug}
          />
        </Paper>
      </>
    </Labeled>
  );
};
