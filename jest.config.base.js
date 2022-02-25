// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsjPresets = require("ts-jest/presets");

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
    "^@liexp/core/(.*)$":
      "<rootDir>/../../packages/@liexp/core/src/$1",
    "^@liexp/shared/(.*)$":
      "<rootDir>/../../packages/@liexp/shared/src/$1",
    "^@liexp/ui/(.*)$":
      "<rootDir>/../../packages/@liexp/ui/src/$1",
  },
  transform: {
    ...tsjPresets.defaults.transform,
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
