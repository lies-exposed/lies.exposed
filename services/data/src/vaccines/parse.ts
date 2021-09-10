/* eslint-disable no-console */
import { sleep } from "@econnessione/shared/utils/promise.utils";
import * as parseDistribution from "./distribution/parseDistribution";
import * as parseEUDRData from "./eudr/parseEUDRData";
import * as vaers from "./vaers/parseVAERSData";

Promise.all([
  vaers.runParseVAERSData()(),
  parseDistribution.run()(),
  parseEUDRData
    .runManufacturerReport()()
    .then(sleep(1000))
    .then(() => parseEUDRData.runTotalsReport()()),
]).catch((e) => {
  console.log(e);
  process.exit();
});
