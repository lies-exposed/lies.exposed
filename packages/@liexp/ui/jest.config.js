// eslint-disable-next-line @typescript-eslint/no-var-requires
const jestBaseConfig = require("../../../jest.config.base");
const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("./tsconfig");

const paths = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: "<rootDir>/src/",
});

const moduleNameMapper = {
  ...jestBaseConfig.moduleNameMapper,
  ...paths,
};

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
  moduleNameMapper,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
