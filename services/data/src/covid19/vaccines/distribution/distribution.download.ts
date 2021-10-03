import * as path from "path";
import { APIRESTClient } from "@liexp/ui/http";
import { DownloadTask } from "../utils/download.utils";

const DISTRIBUTION_PATH = path.resolve(
  __dirname,
  "../../../../data/covid19/vaccines/distribution"
);

export const run = DownloadTask({
  client: APIRESTClient({
    url: "https://raw.githubusercontent.com",
  }),
  url: "/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv",
  outputPath: path.resolve(DISTRIBUTION_PATH, "/vaccinations.csv"),
});
