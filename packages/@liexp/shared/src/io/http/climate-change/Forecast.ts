import { Schema } from "effect";

export const Forecast = Schema.Struct({
  id: Schema.String,
  label: Schema.String,
  lowerColor: Schema.String,
  upperColor: Schema.String,
  gtCO2: Schema.NumberFromString,
  datenum: Schema.NumberFromString,
  year: Schema.NumberFromString,
  month: Schema.NumberFromString,
  day: Schema.NumberFromString,
  datetime: Schema.String,
  data_mean_global: Schema.NumberFromString,
  data_mean_nh: Schema.NumberFromString,
  data_mean_sh: Schema.NumberFromString,
  low: Schema.NumberFromString,
  median: Schema.NumberFromString,
  high: Schema.NumberFromString,
  temp_high: Schema.NumberFromString,
  temp_low: Schema.NumberFromString,
}).annotations({
  title: "Forecast",
});

export type Forecast = typeof Forecast.Type;
