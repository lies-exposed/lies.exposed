/* eslint-disable no-console */
import * as path from "path";
import { sleep } from "@liexp/shared/lib/utils/promise.utils";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as distribution from "./distribution/distribution.parse";
import * as eudr from "./eudr/eudr.parse";
import { TotalsReporter } from "./reporters/TotalReporter";
import * as vaers from "./vaers/parseVAERSData";
import * as who from "./who/who.parse";

export const runTotalsReport = TotalsReporter({
  importPaths: [
    path.resolve(vaers.VAERS_OUTPUT_DIR, "vaers.csv"),
    path.resolve(eudr.EUDR_OUTPUT_DIR, "eudrvigilance.csv"),
  ],
  outputFile: path.resolve(
    __dirname,
    "../../public/covid19/vaccines",
    "adr.csv"
  ),
});

interface ADRSystemOpts {
  manufaturer: boolean;
  totals: boolean;
}

interface ParseOpts {
  vaers: ADRSystemOpts;
  eudr: ADRSystemOpts;
  distribution: ADRSystemOpts;
}

const parseADRTE = (
  v: ADRSystemOpts,
  tm: TE.TaskEither<Error, void>,
  tt: TE.TaskEither<Error, void>
): TE.TaskEither<Error, void> => {
  return pipe(
    v.manufaturer ? tm : TE.right(undefined),
    TE.chainFirst(() => sleep(1000)),
    TE.chain(() => (v.totals ? tt : TE.right(undefined)))
  );
};

const parse = (opts: ParseOpts): TE.TaskEither<Error, void> => {
  return pipe(
    sequenceS(TE.ApplicativePar)({
      vaers: parseADRTE(
        opts.vaers,
        vaers.runManufacturerReport(),
        vaers.runTotalsReport
      ),
      eudr: parseADRTE(
        opts.eudr,
        eudr.runManufacturerReport(),
        eudr.runTotalsReport
      ),
      distribution: parseADRTE(
        opts.distribution,
        distribution.run(),
        TE.of(undefined)
      ),
    }),
    TE.chain(() => sleep(1000)),
    TE.chain(() => runTotalsReport),
    TE.map(() => undefined)
  );
};

parse({
  vaers: {
    manufaturer: false,
    totals: false,
  },
  eudr: {
    manufaturer: false,
    totals: false,
  },
  distribution: {
    manufaturer: false,
    totals: false,
  },
})().catch((e) => {
  console.log(e);
  process.exit();
});

who
  .runTotals()()
  .catch((e) => {
    console.error(e);
    process.exit();
  });
