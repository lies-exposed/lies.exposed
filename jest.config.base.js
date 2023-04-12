// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsjPresets = require("ts-jest/presets");

module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: __dirname + "/tsconfig.test.json",
        isolatesModules: true,
      },
    ],
  },
  moduleDirectories: ["node_modules"],
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
