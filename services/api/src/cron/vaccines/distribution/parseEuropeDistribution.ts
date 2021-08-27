import * as fs from "fs";
import * as path from "path";
import { GetLogger } from "@econnessione/core/logger";
import { VaccineDistributionDatum } from "@econnessione/shared/io/http/covid/VaccineDistributionDatum";
import { groupBy } from "@utils/array.utils";
import { addWeeks } from "date-fns";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as D from "fp-ts/lib/Date";
import * as E from "fp-ts/lib/Either";
import * as Eq from "fp-ts/lib/Eq";
import * as IOE from "fp-ts/lib/IOEither";
import * as Ord from "fp-ts/lib/Ord";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import { NumberFromString } from "io-ts-types";
import { parseCSV } from "../utils/parseCSV";

const TESSyDatum = t.strict(
  {
    YearWeekISO: t.string,
    FirstDose: t.union([t.string, NumberFromString]),
    FirstDoseRefused: t.union([t.string, NumberFromString]),
    SecondDose: t.union([t.string, NumberFromString]),
    UnknownDose: t.union([t.string, NumberFromString]),
    NumberDosesReceived: t.union([t.string, NumberFromString]),
    Region: t.string,
  },
  "TESSyDatum"
);
type TESSyDatum = t.TypeOf<typeof TESSyDatum>;

const processDistributionData =
  (outputPath: string) =>
  (arr: VaccineDistributionDatum[]): TE.TaskEither<Error, void> => {
    return pipe(
      arr,
      groupBy(
        Eq.contramap<Date, VaccineDistributionDatum>((d) => d.date)(Eq.eqDate)
      ),
      A.sort(
        Ord.contramap<Date, VaccineDistributionDatum[]>((d) => d[0].date)(D.Ord)
      ),
      A.map((data) => {
        return pipe(
          data,
          A.reduce<VaccineDistributionDatum, VaccineDistributionDatum>(
            {
              date: data[0].date,
              firstDoses: 0,
              secondDoses: 0,
              cumulativeFirstDoses: 0,
              cumulativeSecondDoses: 0,
            },
            (acc, v) => ({
              ...acc,
              firstDoses: acc.firstDoses + v.firstDoses,
              secondDoses: acc.secondDoses + v.secondDoses,
            })
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
              A.reduce({ firstDoses: 0, secondDoses: 0 }, (acc, r) => ({
                firstDoses: acc.firstDoses + r.firstDoses,
                secondDoses: acc.secondDoses + r.secondDoses,
              }))
            );
            const result = {
              ...v,
              cumulativeFirstDoses: cumulative.firstDoses,
              cumulativeSecondDoses: cumulative.secondDoses,
            };
            return acc.concat([result]);
          })
        );
      },
      TE.right,
      TE.chainIOEitherK((results) => {
        return IOE.tryCatch(
          () => fs.writeFileSync(outputPath, JSON.stringify(results, null, 2)),
          E.toError
        );
      })
    );
  };

const parseTESSyDatum = (v: TESSyDatum): VaccineDistributionDatum => {
  const [year, week] = v.YearWeekISO.split("-W");
  const date = addWeeks(new Date(year), parseInt(week, 10));
  return {
    date,
    firstDoses: parseInt(v.FirstDose.toString(), 10),
    secondDoses: parseInt(v.SecondDose.toString(), 10),
    cumulativeFirstDoses: 0,
    cumulativeSecondDoses: 0,
  };
};

export const run = (): TE.TaskEither<Error, void> => {
  const log = GetLogger("vaccine-distro-data");
  return pipe(
    sequenceS(TE.ApplicativePar)({
      TESSyDatum: parseCSV(log)(
        path.resolve(
          __dirname,
          "../../../data/import/vaccine-distribution.csv"
        ),
        TESSyDatum
      ),
    }),
    TE.chain(({ TESSyDatum }) => {
      const TESSyResults = TESSyDatum.map(parseTESSyDatum);

      return pipe(
        A.sequence(TE.ApplicativePar)([
          processDistributionData(
            path.resolve(
              __dirname,
              "../../../data/europe-vaccine-distribution.json"
            )
          )(TESSyResults),
        ]),
        TE.map(() => log.info.log("Done!"))
      );
    })
  );
};
