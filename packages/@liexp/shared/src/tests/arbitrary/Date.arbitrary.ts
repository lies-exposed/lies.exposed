import { fc } from "@liexp/test/lib/index.js";
import { addYears, subYears } from "date-fns";

export const MIN_DATE = subYears(new Date(), 200);
export const MAX_DATE = addYears(new Date(), 50);
export const DateArb = fc.date({ min: MIN_DATE, max: MAX_DATE });
