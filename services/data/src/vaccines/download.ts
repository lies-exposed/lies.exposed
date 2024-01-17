/* eslint-disable no-console */
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as distrinbution from "./distribution/distribution.parse";
import * as eudr from "./eudr/eudr.download";
import * as who from "./who/who.download";

interface DownloadOpts {
  distribution: boolean;
  eudr: boolean;
  who: boolean;
}

const download = (opts: DownloadOpts): TE.TaskEither<Error, void> => {
  return pipe(
    sequenceS(TE.ApplicativePar)({
      distribution: opts.distribution
        ? distrinbution.run()
        : TE.right(undefined),
      eudr: opts.eudr ? eudr.runDownload() : TE.right(undefined),
      who: opts.who ? who.run : TE.right(undefined),
    }),
    TE.map(() => undefined)
  );
};

download({
  eudr: false,
  who: true,
  distribution: false,
})().catch((e) => {
  console.error(e);
  process.exit();
});
