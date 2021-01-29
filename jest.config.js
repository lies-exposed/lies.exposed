/* eslint-disable @typescript-eslint/no-var-requires */
const jestBaseConfig = require("./jest.config.base");

module.exports = {
  ...jestBaseConfig,
  projects: [
    "<rootDir>/packages/@econnessione/core",
    "<rootDir>/packages/@econnessione/shared",
    "<rootDir>/services/api",
  ],
};
