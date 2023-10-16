import { intervalToDuration } from "date-fns";
import { get } from "lodash";
import * as React from "react";
import { TextField, useRecordContext, type FieldProps } from "react-admin";
import { Box } from "../../mui";

const zeroPad = (num: number): string => String(num).padStart(2, "0");

export const toFormattedDuration = (seconds: number): string => {
  const duration = intervalToDuration({
    start: 0,
    end: seconds * 1000,
  });

  return [duration.hours, duration.minutes, duration.seconds]
    .filter((n): n is number => typeof n === "number")
    .map((n) => zeroPad(n))
    .join(":");
};

export const DurationField: React.FC<FieldProps> = (props) => {
  const r = useRecordContext(props);
  const value = (props.source && get(r, props.source)) ?? 1;

  const formatted = React.useMemo(() => toFormattedDuration(value), [value]);

  return (
    <Box>
      <TextField value={formatted} />
    </Box>
  );
};
