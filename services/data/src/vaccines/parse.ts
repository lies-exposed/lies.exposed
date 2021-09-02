/* eslint-disable no-console */
import * as parseDistribution from "./distribution/parseDistribution";
import * as parseEUDRData from "./eudr/parseEUDRData";

const sleep = async (amount: number): Promise<void> => {
  return await new Promise((resolve) => {
    setTimeout(() => {
      void resolve();
    }, amount);
  });
};

Promise.all([
  parseDistribution.run()(),
  parseEUDRData
    .runManufacturerReport()()
    .then(() => sleep(1000))
    .then(() => parseEUDRData.runTotalsReport()()),
]).catch((e) => {
  console.log(e);
  process.exit();
});
