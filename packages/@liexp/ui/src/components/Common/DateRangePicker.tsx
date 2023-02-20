import * as React from "react";
import { styled } from "../../theme";
import { Grid } from "../mui";
import DatePicker, { type DatePickerProps } from "./DatePicker";

const PREFIX = "date-range-picker";
const classes = {
  root: `${PREFIX}-root`,
  dateInput: `${PREFIX}-dateInput`,
};
const StyledGrid = styled(Grid)(({ theme }) => ({
  [`&.${classes.root}`]: {
    marginTop: 0,
  },
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
  const [[start, end], setDateRange] = React.useState([from, to]);
  return (
    <StyledGrid container spacing={2}>
      <Grid item md={6} sm={6} xs={6}>
        <DatePicker
          className={classes.dateInput}
          size="small"
          value={start}
          variant="standard"
          datatype="date"
          InputLabelProps={{
            disabled: true,
          }}
          onChange={(e) => {
            setDateRange([
              e.target.value === "" ? undefined : e.target.value,
              end,
            ]);
          }}
          onBlur={(e) => {
            onDateRangeChange([start, end]);
          }}
          style={{ width: "100%" }}
          {...props}
        />
      </Grid>
      <Grid item md={6} sm={6} xs={6}>
        <DatePicker
          className={classes.dateInput}
          size="small"
          value={end}
          variant="standard"
          InputLabelProps={{
            disabled: true,
          }}
          onChange={(e) => {
            onDateRangeChange([
              start,
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
