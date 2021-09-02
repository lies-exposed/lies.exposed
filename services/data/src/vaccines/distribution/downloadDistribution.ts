import * as fs from "fs";
import * as path from "path";
import { GetLogger } from "@econnessione/core/logger";
import { APIRESTClient } from "@econnessione/shared/http";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";

const DISTRIBUTION_PATH = path.resolve(
  __dirname,
  "../../../../data/covid19/vaccines/distribution"
);

export const run = (): TE.TaskEither<Error, void> => {
  const log = GetLogger("vaccine-distro-data");
  const githubClient = APIRESTClient({
    url: "https://raw.githubusercontent.com",
  });
  const outputPath = path.resolve(DISTRIBUTION_PATH, "/vaccinations.csv");

  return pipe(
    TE.tryCatch(async () => {
      if (fs.existsSync(outputPath)) {
        log.debug.log("Vaccine distribution data already exists! Resolving...");
        return await Promise.resolve(fs.readFileSync(outputPath));
      }
      const content = await githubClient.get(
        "/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv",
        {}
      );
      fs.writeFileSync(outputPath, content);
      return await Promise.resolve(content);
    }, E.toError),
    TE.map(() => undefined)
  );
};
