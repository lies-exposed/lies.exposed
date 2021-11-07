// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsjPresets = require("ts-jest/presets");

const esModule = "rehype-parse";

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
    "^rehype-parse$": "<rootDir>/../../../node_modules/rehype-parse/index.js",
  },
  transform: {
    ...tsjPresets.defaults.transform,
    // [`<rootDir>/../../../node_modules/${esModule}/.+\\.(j|t)sx?$`]: "ts-jest",
  },
  // transformIgnorePatterns: [
  //   `<rootDir>/../../../node_modules/(?!${esModule}/.*)`,
  // ],
  testMatch: ["**/?(*.)+(spec|test|e2e).ts?(x)"],
  collectCoverageFrom: ["./src/**/*.ts"],
  coveragePathIgnorePatterns: [`node_modules/(?!${esModule})`],
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
