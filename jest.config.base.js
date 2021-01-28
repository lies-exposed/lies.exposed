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
  transform: {
    ...tsjPreset.transform,
  },
  testMatch: [
    "**/?(*.)+(spec|test|e2e).ts?(x)"
  ]
};
