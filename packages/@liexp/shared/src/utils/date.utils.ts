import {
  differenceInHours,
  differenceInDays,
  formatDistanceToNow,
  subYears,
  format,
  parseISO,
  parse,
} from "date-fns";

/**
 * Format a date to pattern `yyyy-MM-dd`
 * @param date
 * @returns
 */
export const formatDate = (date: Date | string): string => {
  if (typeof date === "string") {
    return date;
  }
  return format(date, "yyyy-MM-dd");
};
export const parseDate = (d: string): Date =>
  parse(d, "yyyy-MM-dd", new Date());

/**
 * Format a date with pattern `MMM do yyyy`
 * @param date
 * @returns
 */
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

export {
  parseISO,
  parse,
  differenceInHours,
  differenceInDays,
  formatDistanceToNow,
  subYears,
};
