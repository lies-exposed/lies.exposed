import { Config } from "jest";

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
  "^@react-page/plugins-slate":
    "<rootDir>/__mocks__/react-page-plugin-slate.mock.ts",
  "^@react-page/react-admin":
    "<rootDir>/__mocks__/react-page-react-admin.mock.ts",
};

const config: Config = {
  ...jestBaseConfig,
  displayName: "api",
  transform: {
    // "^.+\\.tsx?$": [
    //   "ts-jest",
    //   {
    //     tsconfig: __dirname + "/tsconfig.json",
    //     isolatesModules: true,
    //   },
    // ],
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  runtime: '@side/jest-runtime',
  modulePaths: [compilerOptions.baseUrl], // <-- This will be set to 'baseUrl' value
  moduleFileExtensions: ["js", "ts", "tsx"],
  moduleNameMapper,
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  coveragePathIgnorePatterns: jestBaseConfig.coveragePathIgnorePatterns.concat([
    "<rootDir>/src/migrations",
    "<rootDir>/src/scripts",
  ]),
  setupFiles: ["<rootDir>/jest.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup-after-env.ts"],
  globalSetup: "<rootDir>/test/globalSetup.ts",
  globalTeardown: "<rootDir>/test/globalTeardown.ts",
};

export default config;
