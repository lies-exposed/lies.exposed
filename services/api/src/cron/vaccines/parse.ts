/* eslint-disable no-console */
import {
  runParse,
  runAggregate as runAggregageVaccineData,
} from "./eudr/parseEUDRData";

runParse()()
  .then(() => runAggregageVaccineData()())
  .catch((e) => {
    console.log(e);
    process.exit();
  });
