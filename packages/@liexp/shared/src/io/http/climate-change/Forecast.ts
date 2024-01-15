import * as t from "io-ts";
import { NumberFromString } from "io-ts-types/lib/NumberFromString.js";

export const Forecast = t.strict(
  {
    id: t.string,
    label: t.string,
    lowerColor: t.string,
    upperColor: t.string,
    gtCO2: NumberFromString,
    datenum: NumberFromString,
    year: NumberFromString,
    month: NumberFromString,
    day: NumberFromString,
    datetime: t.string,
    data_mean_global: NumberFromString,
    data_mean_nh: NumberFromString,
    data_mean_sh: NumberFromString,
    low: NumberFromString,
    median: NumberFromString,
    high: NumberFromString,
    temp_high: NumberFromString,
    temp_low: NumberFromString,
  },
  "Forecast",
);

export type Forecast = t.TypeOf<typeof Forecast>;
