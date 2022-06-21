/* eslint-disable no-console */
import D from "debug";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
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

D.enable(process.env.DEBUG ?? "");

download({
  eudr: false,
  who: true,
  distribution: true,
})()
.then(r => {
  console.log(r);
})
.catch((e) => {
  console.error(e);
  process.exit();
});
