import { intervalToDuration } from "date-fns";
import * as React from "react";
import { Counter } from "./Counter";

const END_DATE = new Date(2027, 11, 31);
const calculateTimeLeft = (): string => {
  const now = new Date();
  const duration = intervalToDuration({ start: now, end: END_DATE });
  return `${duration.years}y ${duration.months}m ${duration.days}g ${
    duration.hours ?? "00"
  }:${duration.minutes ?? "00"}:${duration.seconds ?? "00"}`;
};

export const CO2LeftBudgetCounter: React.FC = () => {
  return <Counter getCount={calculateTimeLeft} sources={[]} />;
};
