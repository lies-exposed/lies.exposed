import { TextField, TextFieldProps } from "@material-ui/core";
import * as React from "react";

type DatePickerProps = TextFieldProps;
const DatePicker: React.FC<DatePickerProps> = (props) => {
  return (
    <TextField
      {...props}
      type="date"
      placeholder="YYYY/MM/DD – YYYY/MM/DD"
      InputLabelProps={{
        shrink: true,
      }}
    />
  );
};

export default DatePicker;
