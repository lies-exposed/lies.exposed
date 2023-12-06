import * as fs from "fs";
import * as path from "path";
import { GetLogger } from "@liexp/core/lib/logger";
import { VaccineDistributionDatum } from "@liexp/shared/lib/io/http/covid/VaccineDistributionDatum";
import { groupBy } from "@liexp/shared/lib/utils/array.utils";
import { GetCSVUtil } from "@liexp/shared/lib/utils/csv.utils";
import { distanceFromNow } from "@liexp/shared/lib/utils/date.utils";
import * as A from "fp-ts/Array";
import * as D from "fp-ts/Date";
import * as E from "fp-ts/Either";
import * as Eq from "fp-ts/Eq";
import * as O from "fp-ts/Option";
import * as Ord from "fp-ts/Ord";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { NumberFromString } from "io-ts-types/lib/NumberFromString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";

const log = GetLogger("vaccine-parse-distribution");
const csvUtil = GetCSVUtil({ log });

const OWIDDatumValue = optionFromNullable(
  t.union([NumberFromString, t.string])
);

export const OWIDDatum = t.strict(
  {
    location: t.string,
    iso_code: t.string,
    date: t.string,
    total_vaccinations: OWIDDatumValue,
    people_vaccinated: OWIDDatumValue,
    people_fully_vaccinated: OWIDDatumValue,
    total_boosters: OWIDDatumValue,
    daily_vaccinations_raw: OWIDDatumValue,
    daily_vaccinations: OWIDDatumValue,
    total_vaccinations_per_hundred: OWIDDatumValue,
    people_vaccinated_per_hundred: OWIDDatumValue,
    people_fully_vaccinated_per_hundred: OWIDDatumValue,
    total_boosters_per_hundred: OWIDDatumValue,
    daily_vaccinations_per_million: OWIDDatumValue,
  },
  "OWIDDatum"
);
export type OWIDDatum = t.TypeOf<typeof OWIDDatum>;

const toZero: (o: O.Option<number | string>) => number = (opt) =>
  pipe(
    opt,
    O.filter((s): s is number => typeof s !== "string"),
    O.getOrElse(() => 0)
  );

const processDistributionData =
  (outputPath: string) =>
  (arr: VaccineDistributionDatum[]): TE.TaskEither<Error, void> => {
    const groupedItems = pipe(
      arr,
      A.sort(
        Ord.contramap<Date, VaccineDistributionDatum>((d) => d.date)(D.Ord)
      ),
      groupBy(Eq.contramap<Date, VaccineDistributionDatum>((d) => d.date)(D.Eq))
    );

    return pipe(
      groupedItems,
      A.map((data) => {
        // console.log(data.length);
        return pipe(
          data,
          A.reduce<VaccineDistributionDatum, VaccineDistributionDatum>(
            {
              date: data[0].date,
              location: data[0].location,
              iso_code: data[0].iso_code,
              total_boosters: 0,
              total_vaccinations: 0,
              total_boosters_per_hundred: 0,
              total_vaccinations_per_hundred: 0,
              people_fully_vaccinated: 0,
              people_vaccinated: 0,
              people_vaccinated_per_hundred: 0,
              people_fully_vaccinated_per_hundred: 0,
              daily_vaccinations_per_million: 0,
              daily_vaccinations: 0,
              daily_vaccinations_raw: 0,
            },
            (acc, v) => {
              const totalBoosters = v.total_boosters;
              const totalVaccinations = v.total_vaccinations;

              return {
                ...acc,
                total_boosters: totalBoosters,
                total_vaccinations: totalVaccinations,
              };
            }
          )
        );
      }),
      (results) => {
        return pipe(
          results,
          A.reduceWithIndex<
            VaccineDistributionDatum,
            VaccineDistributionDatum[]
          >([], (index, acc, v) => {
            const cumulative = pipe(
              results,
              A.takeLeft(index),
              A.reduce(
                { total_boosters: 0, total_vaccinations: 0 },
                (acc, r) => ({
                  ...acc,
                  total_boosters:
                    typeof r.total_boosters === "string" ? 0 : r.total_boosters,
                  total_vaccinations:
                    typeof r.total_vaccinations === "string"
                      ? 0
                      : r.total_vaccinations,
                })
              )
            );
            const result = {
              ...v,
              date: distanceFromNow(v.date) as any,
              total_boosters: cumulative.total_boosters,
              total_vaccinations: cumulative.total_vaccinations,
            };
            return acc.concat([result]);
          })
        );
      },
      TE.right,
      TE.chain((results) => csvUtil.writeToPath(outputPath, results))
    );
  };

const parseDatum = (v: OWIDDatum): VaccineDistributionDatum => {
  return {
    ...v,
    date: new Date(v.date),
    people_vaccinated: toZero(v.people_vaccinated),
    people_fully_vaccinated: toZero(v.people_fully_vaccinated),
    people_fully_vaccinated_per_hundred: toZero(
      v.people_fully_vaccinated_per_hundred
    ),
    people_vaccinated_per_hundred: toZero(
      v.people_fully_vaccinated_per_hundred
    ),
    daily_vaccinations: toZero(v.daily_vaccinations),
    daily_vaccinations_per_million: toZero(v.daily_vaccinations_per_million),
    daily_vaccinations_raw: toZero(v.daily_vaccinations_raw),
    total_boosters: toZero(v.total_boosters),
    total_boosters_per_hundred: toZero(v.total_boosters_per_hundred),
    total_vaccinations: toZero(v.total_vaccinations),
    total_vaccinations_per_hundred: toZero(v.total_vaccinations_per_hundred),
  };
};

const DISTRIBUTION_PATH = path.resolve(
  __dirname,
  "../../../../data/covid19/vaccines/distribution"
);

export const run = (): TE.TaskEither<Error, void> => {
  const inputPath = path.resolve(DISTRIBUTION_PATH, "vaccinations.csv");
  const outputPath = path.resolve(DISTRIBUTION_PATH, "world-distribution.csv");

  return pipe(
    TE.tryCatch(async () => {
      return await Promise.resolve(
        fs.readFileSync(inputPath, {
          encoding: "utf-8",
        })
      );
    }, E.toError),
    TE.chain((content) => csvUtil.parseString(content, OWIDDatum)),
    TE.chain((distribution) => {
      const owidData = distribution.map(parseDatum);

      return pipe(
        A.sequence(TE.ApplicativePar)([
          processDistributionData(outputPath)(
            owidData.filter((d) => d.iso_code === "OWID_EUR")
          ),
        ]),
        TE.map(() => log.info.log("Done!"))
      );
    })
  );
};
