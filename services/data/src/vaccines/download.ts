/* eslint-disable no-console */
import { run as runDistributionDownload } from "./distribution/parseDistribution";
import { runDownload } from "./eudr/downloadEUDRData";

Promise.all([runDistributionDownload()(), runDownload()()]).catch((e) => {
  console.error(e);
  process.exit();
});
