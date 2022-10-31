/* eslint-disable @typescript-eslint/no-var-requires */
const jestBaseConfig = require("../../jest.config.base");
const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig");

const paths = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: "<rootDir>/src/",
});

const moduleNameMapper = {
  ...paths,
  ...jestBaseConfig.moduleNameMapper,
};

module.exports = {
  ...jestBaseConfig,
  displayName: 'api',
  globals: {
    "ts-jest": {
      tsconfig: __dirname + "/tsconfig.json",
      isolatesModules: true,
    },
  },
  moduleNameMapper,
  collectCoverageFrom: ["./src/**/*.ts"],
  coveragePathIgnorePatterns: jestBaseConfig.coveragePathIgnorePatterns.concat([
    "/src/migrations",
    "/src/scripts",
  ]),
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globalSetup: "<rootDir>/test/globalSetup.ts",
  globalTeardown: "<rootDir>/test/globalTeardown.ts",
};
