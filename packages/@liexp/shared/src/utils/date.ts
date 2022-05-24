import { formatDistanceToNow, format, parseISO } from "date-fns";

export const formatDate = (date: Date): string => format(date, "yyyy-MM-dd");
export const formatDateToShort = (date: Date): string =>
  format(date, "MMM do yyyy");

export const distanceFromNow = formatDistanceToNow;

export { parseISO }
