const { configPaths } = require("react-app-rewire-alias");
const { aliasDangerous } = require("react-app-rewire-alias/lib/aliasDangerous");
const { pipe } = require("fp-ts/lib/pipeable");
const R = require("fp-ts/lib/Record");
const path = require("path");

module.exports = function override(config) {
  const sharedPaths = pipe(
    configPaths("../../packages/@econnessione/shared/tsconfig.json"),
    R.map((p) => path.join("../../../packages/@econnessione/shared/src", p))
  );
  const webPaths = configPaths("tsconfig.paths.json");

  aliasDangerous({
    ...sharedPaths,
    ...webPaths,
  })(config);
  return config;
};
