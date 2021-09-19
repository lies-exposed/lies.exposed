import * as path from "path";
import { APIRESTClient } from "@econnessione/ui/http";
import { DownloadTask } from "../utils/download.utils";

const WHO_DATA_DIR = path.resolve(
  __dirname,
  "../../../../data/covid19/who/import"
);

export const run = DownloadTask({
  client: APIRESTClient({
    url: "https://covid19.who.int/",
  }),
  url: "/WHO-COVID-19-global-data.csv",
  outputPath: path.resolve(WHO_DATA_DIR, "who-covid-19-global-data.csv"),
});
