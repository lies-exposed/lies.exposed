import * as React from "react";
import { TextField, type TextFieldProps } from "react-admin";

export const ColorInput: React.FC<TextFieldProps> = (props) => {
  return <TextField {...props} />;
};
