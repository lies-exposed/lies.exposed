import {
  DatePicker as BDatePicker,
  DatepickerProps as BDatePickerProps,
} from "baseui/datepicker"
import * as React from "react"

type DatePickerProps = Omit<BDatePickerProps, "onChange"> & {
  onChange: (value: { date: Date | Date[] }) => void
}
const DatePicker: React.FC<DatePickerProps> = (props) => {
  return <BDatePicker {...props} placeholder="YYYY/MM/DD – YYYY/MM/DD" />
}

export default DatePicker
