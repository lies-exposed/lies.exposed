// eslint-disable-next-line @typescript-eslint/no-var-requires
const jestBaseConfig = require('../../../jest.config.base');

module.exports = {
  ...jestBaseConfig,
  displayName: '@econnessione/shared',
  // globalSetup: '../../../tests/globalSetup.ts',
};
