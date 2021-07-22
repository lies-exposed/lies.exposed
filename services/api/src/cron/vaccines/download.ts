/* eslint-disable no-console */
import { runDownload } from "./eudr/downloadEUDRData";

runDownload()().catch((e) => {
  console.error(e);
  process.exit();
});
