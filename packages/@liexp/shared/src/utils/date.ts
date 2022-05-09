import { formatDistanceToNow, format } from "date-fns";

export const formatDate = (date: Date): string => format(date, "yyyy-MM-dd");
export const formatDateToShort = (date: Date): string =>
  format(date, "MMM Do yyyy");

export const distanceFromNow = formatDistanceToNow;
