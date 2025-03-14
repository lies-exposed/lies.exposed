/* eslint-disable @typescript-eslint/naming-convention */
import { VaccineDatum } from "@liexp/shared/lib/io/http/covid/VaccineDatum";
import * as t from "io-ts";

const {
  total_deaths,
  total_death_0_1_month,
  total_death_2_month_2_years,
  total_death_3_11_years: total_death_3_12_years,
  total_death_12_17_years,
  total_death_18_64_years,
  total_death_65_85_years,
  total_death_more_than_85_years,
  total_injuries,
  total_severe,
  total_reported,
  total_death_years_not_specified,
  ...vaccineDatumProps
} = VaccineDatum.type.props;
export const VaccineEntry = Schema.Struct(
  {
    ...vaccineDatumProps,
  },
  "VaccineEntry"
);
export type VaccineEntry = t.TypeOf<typeof VaccineEntry>;
