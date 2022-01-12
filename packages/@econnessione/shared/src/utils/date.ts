import { distanceInWordsToNow } from "date-fns";

export const formatDate = (date: Date): string => date.toLocaleDateString("it");

export const distanceFromNow = distanceInWordsToNow;
