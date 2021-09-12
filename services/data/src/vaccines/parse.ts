/* eslint-disable no-console */
import { sleep } from "@econnessione/shared/utils/promise.utils";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as distribution from "./distribution/parseDistribution";
import * as eudr from "./eudr/parseEUDRData";
import * as vaers from "./vaers/parseVAERSData";

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
    TE.map(() => undefined)
  );
};

parse({
  vaers: {
    manufaturer: false,
    totals: true,
  },
  eudr: {
    manufaturer: false,
    totals: true,
  },
  distribution: {
    manufaturer: false,
    totals: false,
  },
})().catch((e) => {
  console.log(e);
  process.exit();
});
