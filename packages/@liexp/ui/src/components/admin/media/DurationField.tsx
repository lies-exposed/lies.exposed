import { intervalToDuration } from "date-fns";
import * as React from "react";
import { TextField } from "../../mui";
import { useInput, type InputProps } from "../react-admin";

const zeroPad = (num: number): string => String(num).padStart(2, "0");

type Duration = `${number}:${number}:${number}`;

const isDuration = (s: string): s is Duration => {
  return /^\d{2}:\d{2}:\d{2}$/.test(s);
};

export const toFormattedDuration = (seconds: number): Duration => {
  const duration = intervalToDuration({
    start: 0,
    end: seconds * 1000,
  });

  return [duration.hours, duration.minutes, duration.seconds]
    .filter((n): n is number => typeof n === "number")
    .map((n) => zeroPad(n))
    .join(":") as Duration;
};

export const fromMaybeDuration = (s: string): Duration => {
  const chunks = s.split(":").filter((n) => n !== "");
  const timeChunks = Array.from({ length: 3 }).reduce<string[]>(
    (acc, _, currentIndex) => {
      return acc.concat(zeroPad((chunks[currentIndex] as any) ?? 0));
    },
    [],
  );

  return timeChunks.join(":") as Duration;
};

export const durationToSeconds = (duration: Duration): number => {
  const [hours, minutes, seconds] = duration.split(":").map((n) => parseInt(n));
  return hours * 3600 + minutes * 60 + seconds;
}

export const DurationField: React.FC<InputProps> = (props) => {
  const {
    field,
    fieldState: { isTouched, invalid, error },
    formState: { isSubmitted, },
  } = useInput({
    ...props,
    format: (v) => {
      if (isDuration(v)) {
        return v;
      } else if (typeof v === "number") {
        return toFormattedDuration(v);
      }

      return fromMaybeDuration(v);
    },
  });

  return (
    <TextField
      {...field}
      error={(isTouched || isSubmitted) && invalid}
      helperText={
        (isTouched || isSubmitted) && invalid ? error?.message : `Equivalent to ${durationToSeconds(field.value)} seconds`
      }
      size="small"
    />
  );
};
