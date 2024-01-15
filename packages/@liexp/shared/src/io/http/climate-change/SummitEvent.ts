import * as t from "io-ts";
import { NumberFromString } from "io-ts-types/lib/NumberFromString.js";

export const SummitEvent = t.strict(
  {
    year: NumberFromString,
    label: t.string,
  },
  "SummitEvent",
);

export type SummitEvent = t.TypeOf<typeof SummitEvent>;
