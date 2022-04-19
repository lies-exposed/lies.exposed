import { TextField, TextFieldProps } from "@material-ui/core";
import * as React from "react";

type DatePickerProps = TextFieldProps;
const DatePicker: React.FC<DatePickerProps> = ({ InputLabelProps, ...props}) => {
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
