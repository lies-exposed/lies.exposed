/* eslint-disable @typescript-eslint/no-var-requires */
const jestBaseConfig = require("./jest.config.base");

module.exports = {
  ...jestBaseConfig,
  projects: [
    "<rootDir>/packages/@liexp/core",
    "<rootDir>/packages/@liexp/shared",
    "<rootDir>/packages/@liexp/ui",
    "<rootDir>/services/api",
  ],
};
