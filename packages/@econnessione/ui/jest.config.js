// eslint-disable-next-line @typescript-eslint/no-var-requires
const jestBaseConfig = require("../../../jest.config.base");
const tsJestPresets = require("ts-jest/presets");
const { pathsToModuleNameMapper } = require("ts-jest/utils");

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
  displayName: "@econnessione/ui",
  globals: {
    "ts-jest": {
      tsconfig: __dirname + "/tsconfig.test.json",
      isolatesModules: true,
    },
  },
  collectCoverageFrom: ["./src/**/*.tsx?"],
  coveragePathIgnorePatterns: jestBaseConfig.coveragePathIgnorePatterns.concat([
    "/src/theme",
  ]),
  moduleNameMapper,
};
