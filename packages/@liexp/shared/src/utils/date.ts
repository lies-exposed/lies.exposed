import { formatDistanceToNow, format, parseISO } from "date-fns";

export const formatDate = (date: Date): string => format(date, "yyyy-MM-dd");
export const formatDateToShort = (date: Date): string =>
  format(date, "MMM do yyyy");

export const formatAnyDateToShort = (date: any): string => {
  if (typeof date === "string") {
    return formatDateToShort(parseISO(date));
  }
  return formatDateToShort(date);
};
export const distanceFromNow = formatDistanceToNow;

export { parseISO };
