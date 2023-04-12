// eslint-disable-next-line @typescript-eslint/no-var-requires
const jestBaseConfig = require("../../../jest.config.base");

module.exports = {
  ...jestBaseConfig,
  displayName: "@liexp/ui",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: __dirname + "/tsconfig.json",
        isolatesModules: true,
      },
    ],
  },
  collectCoverageFrom: ["./src/**/*.tsx?"],
  coveragePathIgnorePatterns: jestBaseConfig.coveragePathIgnorePatterns.concat([
    "/src/theme",
  ]),
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
