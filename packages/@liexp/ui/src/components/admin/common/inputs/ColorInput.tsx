import get from "lodash/get";
import * as React from "react";
import { TextInput, type TextInputProps, useRecordContext } from "react-admin";

export const ColorInput: React.FC<TextInputProps> = (props) => {
  const record = useRecordContext();
  const color = get(record, props.source);

  return (
    <TextInput
      {...props}
      style={{
        border: color?.length === 6 ? `2px solid #${color}` : undefined,
      }}
    />
  );
};
