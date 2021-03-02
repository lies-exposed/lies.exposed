/* eslint-disable @typescript-eslint/no-var-requires */
const jestBaseConfig = require("../../jest.config.base");
const { pathsToModuleNameMapper } = require("ts-jest/utils");
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
  moduleNameMapper,
  globals: {
    "ts-jest": {
      tsconfig: __dirname + "/tsconfig.test.json",
      isolatesModules: true,
    },
  },
  globalSetup: "<rootDir>/test/globalSetup.ts",
  globalTeardown: "<rootDir>/test/globalTeardown.ts",
};
