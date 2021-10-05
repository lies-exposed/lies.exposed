// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.test.json",
      isolatesModules: true,
    },
  },
  moduleDirectories: ["node_modules"],
  moduleNameMapper: {
    "^@econnessione/core/(.*)$":
      "<rootDir>/../../packages/@econnessione/core/src/$1",
    "^@econnessione/shared/(.*)$":
      "<rootDir>/../../packages/@econnessione/shared/src/$1",
    "^@econnessione/ui/(.*)$":
      "<rootDir>/../../packages/@econnessione/ui/src/$1",
  },
  transform: {
    ...tsjPreset.transform,
  },
  testMatch: ["**/?(*.)+(spec|test|e2e).ts?(x)"],
  collectCoverageFrom: ["./src/**/*.ts"],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  coveragePathIgnorePatterns: ["node_modules", "src/typings/"],
};
