const { aliasDangerous } = require("react-app-rewire-alias/lib/aliasDangerous");
const { configPaths } = require("react-app-rewire-alias");
const { pipe } = require("fp-ts/lib/pipeable");
const R = require("fp-ts/lib/Record");
const path = require("path");

module.exports = function override(config) {
  const sharedPaths = pipe(
    configPaths("../../packages/@econnessione/shared/tsconfig.json"),
    R.map((p) => path.resolve("../../packages/@econnessione/shared/src", p))
  );

  const webPaths = pipe(
    configPaths("tsconfig.paths.json"),
    R.map((p) => path.resolve("./src", p))
  );

  const aliases = {
    ...sharedPaths,
    ...webPaths,
  };

  aliasDangerous({
    ...aliases,
  })(config);

  return config;
};
