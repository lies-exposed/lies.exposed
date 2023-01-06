import { formatDistanceToNow, format, parseISO, parse } from "date-fns";

export const formatDate = (date: Date): string => format(date, "yyyy-MM-dd");
export const formatDateToShort = (date: Date): string =>
  format(date, "MMM do yyyy");

export const formatAnyDateToShort = (date: any): string => {
  if (typeof date === "string") {
    return formatDateToShort(parseISO(date));
  }
  if (typeof date === "object") {
    return formatDateToShort(date);
  }
  return formatDateToShort(new Date(date));
};
export const distanceFromNow = formatDistanceToNow;

export { parseISO, parse };
