import * as React from "react";
import { styled } from "../../theme";
import { Grid } from "../mui";
import DatePicker, { DatePickerProps } from "./DatePicker";

const PREFIX = "date-range-picker";
const classes = {
  root: `${PREFIX}-root`,
  dateInput: `${PREFIX}-dateInput`,
};
const StyledGrid = styled(Grid)(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.dateInput}`]: {
    marginBottom: theme.spacing(2),
  },
}));

type DateRangePickerProps = DatePickerProps & {
  from?: string;
  to?: string;
  onDateRangeChange: (d: [string | undefined, string | undefined]) => void;
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  from,
  to,
  onDateRangeChange,
  ...props
}) => {
  return (
    <StyledGrid container spacing={2}>
      <Grid item md={2} sm={3} xs={6}>
        <DatePicker
          className={classes.dateInput}
          size="small"
          value={from}
          variant="standard"
          datatype="date"
          InputLabelProps={{
            disabled: true,
          }}
          onChange={(e) => {
            onDateRangeChange([
              e.target.value === "" ? undefined : e.target.value,
              to,
            ]);
          }}
          style={{ width: "100%" }}
          {...props}
        />
      </Grid>
      <Grid item md={2} sm={3} xs={6}>
        <DatePicker
          className={classes.dateInput}
          size="small"
          value={to}
          variant="standard"
          InputLabelProps={{
            disabled: true,
          }}
          onChange={(e) => {
            onDateRangeChange([
              from,
              e.target.value === "" ? undefined : e.target.value,
            ]);
          }}
          style={{ width: "100%" }}
          {...props}
        />
      </Grid>
    </StyledGrid>
  );
};
