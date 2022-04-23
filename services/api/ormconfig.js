/* eslint-disable @typescript-eslint/no-var-requires */
require("module-alias")(process.cwd());
const path = require("path");
const { getDBOptions } = require("./build/utils/getDBOptions");
const { ENV } = require("./build/io/ENV");
const { PathReporter } = require("io-ts/lib/PathReporter");

require("dotenv").config({
  path: path.resolve(
    process.cwd(),
    process.env.DOTENV_CONFIG_PATH !== undefined
      ? process.env.DOTENV_CONFIG_PATH
      : "../../.env"
  ),
});

const decodedEnv = ENV.decode(process.env);

if (decodedEnv._tag === "Left") {
  console.error(PathReporter.report(decodedEnv));
  throw new Error("process.env is malformed");
}
const env = decodedEnv.right;

module.exports = getDBOptions(env, true);
