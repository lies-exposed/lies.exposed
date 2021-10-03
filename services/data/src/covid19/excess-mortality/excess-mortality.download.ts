import * as path from "path";
import { APIRESTClient } from "@econnessione/ui/http";
import { DownloadTask } from "../vaccines/utils/download.utils";

const EXCESS_MORTALITY_DIR = path.resolve(
  process.cwd(),
  "public/covid19/excess_mortality/import"
);

export const run = DownloadTask({
  client: APIRESTClient({
    url: "https://raw.githubusercontent.com",
  }),
  url: "/owid/covid-19-data/master/public/data/excess_mortality/excess_mortality.csv",
  outputPath: path.resolve(EXCESS_MORTALITY_DIR, "excess_mortality.csv"),
});

// eslint-disable-next-line no-console
run().then(console.log).catch(console.error);
