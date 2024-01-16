import * as React from "react";
import { TextField, type TextFieldProps } from "../mui/index.js";

export type DatePickerProps = TextFieldProps;

const DatePicker: React.FC<DatePickerProps> = ({
  InputLabelProps,
  ...props
}) => {
  return (
    <TextField
      {...props}
      type="date"
      placeholder=""
      InputLabelProps={{
        shrink: true,
        ...InputLabelProps,
      }}
    />
  );
};

export default DatePicker;
