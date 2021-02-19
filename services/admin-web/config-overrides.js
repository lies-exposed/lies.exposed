const { alias } = require("react-app-rewire-alias");

module.exports = function override(config) {
  alias({
    "@components": "./src/components",
    "@econnessione/shared": "../../packages/@econnessione/shared/src"
  })(config);
  return config;
};
