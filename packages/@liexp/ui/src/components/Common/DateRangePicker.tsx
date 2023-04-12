import { formatDate } from "@liexp/shared/lib/utils/date";
import { addDays, differenceInDays, parseISO, subYears } from "date-fns";
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
  from?: string;
  to?: string;
  maxDate?: Date;
  minDate?: Date;
  onDateRangeChange: (d: [string | undefined, string | undefined]) => void;
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
            setDateRange([
              start,
              e.target.value === "" ? undefined : e.target.value,
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
  const fromDate = minDate ?? subYears(new Date(), 10);
  const toDate = maxDate ?? new Date();
  const fromIndex = 0;
  const toIndex = differenceInDays(toDate, fromDate);

  const [[start, end], setDateRange] = React.useState([from, to]);

  const endDate = end ? parseISO(end) : toDate;
  const startDate = start ? parseISO(start) : fromDate;
  const startIndex = differenceInDays(startDate, fromDate);
  const endIndex = differenceInDays(endDate, fromDate);

  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <Typography>{start}</Typography>
      <Slider
        value={[startIndex, endIndex]}
        min={fromIndex}
        max={toIndex}
        onChange={(_, dates) => {
          if (Array.isArray(dates)) {
            setDateRange([
              formatDate(addDays(fromDate, dates[0])),
              formatDate(addDays(fromDate, dates[1])),
            ]);
          }
        }}
        onChangeCommitted={(_, dates) => {
          if (Array.isArray(dates)) {
            const dateRange: [string, string] = [
              formatDate(addDays(fromDate, dates[0])),
              formatDate(addDays(fromDate, dates[1])),
            ];
            onDateRangeChange(dateRange);
          }
        }}
      />
      <Typography>{end}</Typography>
    </Stack>
  );
};
