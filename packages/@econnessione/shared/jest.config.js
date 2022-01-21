// eslint-disable-next-line @typescript-eslint/no-var-requires
const jestBaseConfig = require("../../../jest.config.base");
const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig");

const paths = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: "<rootDir>/src/",
});

const moduleNameMapper = {
  ...paths,
};

module.exports = {
  ...jestBaseConfig,
  displayName: "@econnessione/shared",
  globals: {
    "ts-jest": {
      tsconfig: __dirname + "/tsconfig.test.json",
      isolatesModules: true,
    },
  },
  testPathIgnorePatterns: ["/node_modules/", "/http/Common/__tests__"],
  collectCoverageFrom: ["./src/**/*.ts"],
  coveragePathIgnorePatterns: jestBaseConfig.coveragePathIgnorePatterns.concat([
    "/src/endpoints/",
    "/src/io/",
    "/src/mock-data/",
    "/src/tests/",
  ]),
  moduleNameMapper,
};
