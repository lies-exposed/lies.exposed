import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInYears,
} from "date-fns";
import * as React from "react";
import { Counter } from "./Counter.js";

const END_DATE = new Date(2027, 11, 31);
const calculateTimeLeft = (): string => {
  const now = new Date();
  const years = differenceInYears(now, END_DATE);
  const months = differenceInMonths(now, END_DATE);
  const days = differenceInDays(now, END_DATE);
  const hours = differenceInHours(now, END_DATE);
  const minutes = differenceInMinutes(now, END_DATE);
  const seconds = differenceInSeconds(now, END_DATE);
  return `${years}y ${months}m ${days}g ${hours ?? "00"}:${minutes ?? "00"}:${
    seconds ?? "00"
  }`;
};

export const CO2LeftBudgetCounter: React.FC = () => {
  return <Counter getCount={calculateTimeLeft} sources={[]} />;
};
