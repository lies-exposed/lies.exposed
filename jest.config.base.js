// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
  roots: ["./"],
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.test.json",
      isolatesModules: true,
    },
  },
  moduleDirectories: ["node_modules"],
  transform: {
    ...tsjPreset.transform,
  },
  // globalSetup: '<rootDir>/tests/globalSetup.ts',
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).ts'],
};
