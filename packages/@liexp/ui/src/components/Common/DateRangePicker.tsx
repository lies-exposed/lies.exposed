import {
  formatAnyDateToShort,
  formatDate,
  parseDate,
} from "@liexp/shared/lib/utils/date.utils";
import { addDays, differenceInDays, subYears } from "date-fns";
import * as React from "react";
import { styled } from "../../theme";
import { Slider, Stack, Typography, Grid } from "../mui";
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
    // marginBottom: theme.spacing(2),
  },
}));

type DateRangePickerProps = DatePickerProps & {
  from?: Date;
  to?: Date;
  maxDate?: Date;
  minDate?: Date;
  onDateRangeChange: (d: [Date | undefined, Date | undefined]) => void;
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  from,
  to,
  onDateRangeChange,
  minDate,
  maxDate,
  ...props
}) => {
  const [[start, end], setDateRange] = React.useState([from, to]);
  return (
    <StyledGrid container spacing={2}>
      <Grid item md={6} sm={6} xs={6}>
        <DatePicker
          className={classes.dateInput}
          size="small"
          value={start ? formatDate(start) : ""}
          variant="standard"
          datatype="date"
          InputLabelProps={{
            disabled: true,
          }}
          onChange={(e) => {
            setDateRange([
              e.target.value === "" ? undefined : parseDate(e.target.value),
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
          value={end ? formatDate(end) : ""}
          variant="standard"
          InputLabelProps={{
            disabled: true,
          }}
          onChange={(e) => {
            setDateRange([
              start,
              e.target.value === "" ? undefined : parseDate(e.target.value),
            ]);
          }}
          onBlur={() => {
            onDateRangeChange([start, end]);
          }}
          style={{ width: "100%" }}
          {...props}
        />
      </Grid>
    </StyledGrid>
  );
};

export const DateRangeSlider: React.FC<DateRangePickerProps> = ({
  from,
  to,
  minDate,
  maxDate,
  onDateRangeChange,
}) => {
  const fromDate = minDate ?? from ?? subYears(new Date(), 10);
  const toDate = maxDate ?? to ?? new Date();
  const fromIndex = 0;
  const toIndex = differenceInDays(toDate, fromDate);

  const [[start, end], setDateRange] = React.useState([
    from ?? fromDate,
    to ?? toDate,
  ]);

  const startIndex = differenceInDays(start, fromDate);
  const endIndex = differenceInDays(end, fromDate);

  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <Typography>{formatAnyDateToShort(start)}</Typography>
      <Slider
        value={[startIndex, endIndex]}
        min={fromIndex}
        max={toIndex}
        onChange={(_, dates) => {
          if (Array.isArray(dates)) {
            setDateRange([
              addDays(fromDate, dates[0]),
              addDays(fromDate, dates[1]),
            ]);
          }
        }}
        onChangeCommitted={(_, dates) => {
          if (Array.isArray(dates)) {
            const dateRange: [Date, Date] = [
              addDays(fromDate, dates[0]),
              addDays(fromDate, dates[1]),
            ];
            onDateRangeChange(dateRange);
          }
        }}
      />
      <Typography>{formatAnyDateToShort(end)}</Typography>
    </Stack>
  );
};
