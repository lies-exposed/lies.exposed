/* eslint-disable @typescript-eslint/no-var-requires */
const jestBaseConfig = require("../../jest.config.base");
const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

const paths = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: "<rootDir>/src/",
});

const moduleNameMapper = {
  ...paths,
  ...jestBaseConfig.moduleNameMapper,
  "^@react-page/editor": "<rootDir>/__mocks__/react-page-editor.mock.ts",
  "^@react-page/plugins-slate": "<rootDir>/__mocks__/react-page-plugin-slate.mock.ts",
  "^@react-page/react-admin": "<rootDir>/__mocks__/react-page-react-admin.mock.ts",
};

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...jestBaseConfig,
  displayName: "api",
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: __dirname + "/tsconfig.json",
        isolatesModules: true,
      },
    ],
  },
  moduleNameMapper,
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  coveragePathIgnorePatterns: jestBaseConfig.coveragePathIgnorePatterns.concat([
    "<rootDir>/src/migrations",
    "<rootDir>/src/scripts",
  ]),
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  globalSetup: "<rootDir>/test/globalSetup.ts",
  globalTeardown: "<rootDir>/test/globalTeardown.ts",
};
