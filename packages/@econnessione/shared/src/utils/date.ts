import { distanceInWordsToNow, format } from "date-fns";

export const formatDate = (date: Date): string => format(date, "YYYY-MM-DD");

export const distanceFromNow = distanceInWordsToNow;
