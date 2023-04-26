/* eslint-disable @typescript-eslint/no-var-requires */
require("module-alias")(process.cwd());
const { getDataSource } = require("./build/utils/data-source");
const { ENV } = require("./build/io/ENV");
const { PathReporter } = require("io-ts/lib/PathReporter");
const { loadENV } = require("@liexp/core/lib/env/utils");

loadENV(
  process.cwd(),
  process.env.DOTENV_CONFIG_PATH !== undefined
    ? process.env.DOTENV_CONFIG_PATH
    : "../../.env"
);

const decodedEnv = ENV.decode(process.env);

if (decodedEnv._tag === "Left") {
  console.error(PathReporter.report(decodedEnv));
  throw new Error("process.env is malformed");
}
const env = decodedEnv.right;

const dataSource = getDataSource(env, true);

dataSource.initialize();

module.exports = {
  default: dataSource,
};
